package api

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"sykell-crawler/internal/handlers"
	"sykell-crawler/internal/repositories"
	"sykell-crawler/internal/services"
	"sykell-crawler/pkg/config"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type Server struct {
	router        *gin.Engine
	db            *gorm.DB
	redis         *redis.Client
	config        *config.Config
	workerCtx     context.Context
	workerCancel  context.CancelFunc
	workerWg      sync.WaitGroup
}

func NewServer(db *gorm.DB, redis *redis.Client, cfg *config.Config) *Server {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(handlers.CORSMiddleware(cfg))

	ctx, cancel := context.WithCancel(context.Background())

	s := &Server{
		router:       router,
		db:           db,
		redis:        redis,
		config:       cfg,
		workerCtx:    ctx,
		workerCancel: cancel,
	}

	s.setupRoutes()
	s.startBackgroundWorkers()

	return s
}

func (s *Server) setupRoutes() {
	userRepo := repositories.NewUserRepository(s.db)
	urlRepo := repositories.NewURLRepository(s.db)

	authService := services.NewAuthService(userRepo, s.config.JWTSecret)
	queueService := services.NewQueueService(s.redis)
	urlService := services.NewURLService(urlRepo, queueService)

	authHandler := handlers.NewAuthHandler(authService)
	urlHandler := handlers.NewURLHandler(urlService)

	api := s.router.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/logout", authHandler.Logout)
		}

		protected := api.Group("/")
		protected.Use(handlers.AuthMiddleware(authService))
		{
			urls := protected.Group("/urls")
			{
				urls.POST("", urlHandler.AddURL)
				urls.GET("", urlHandler.GetAllURLs)
				urls.GET("/:id", urlHandler.GetURL)
				urls.POST("/bulk", urlHandler.BulkAction)
			}
		}
	}

	s.router.GET("/health", s.healthCheck)
}

func (s *Server) startBackgroundWorkers() {
	urlRepo := repositories.NewURLRepository(s.db)
	resultRepo := repositories.NewCrawlResultRepository(s.db)

	queueService := services.NewQueueService(s.redis)
	crawlerService := services.NewCrawlerService(urlRepo, resultRepo, queueService, s.config)

	s.workerWg.Add(1)
	go func() {
		defer s.workerWg.Done()
		log.Println("Starting background crawler worker...")
		if err := queueService.ProcessCrawlJobs(s.workerCtx, crawlerService); err != nil {
			if err != context.Canceled {
				log.Printf("Crawler worker error: %v", err)
			} else {
				log.Println("Crawler worker stopped gracefully")
			}
		}
	}()
}

func (s *Server) healthCheck(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	health := gin.H{
		"status":    "ok",
		"timestamp": time.Now().Unix(),
		"checks": gin.H{
			"database": s.checkDatabase(ctx),
			"redis":    s.checkRedis(ctx),
		},
	}

	// Determine overall status
	dbStatus := health["checks"].(gin.H)["database"].(gin.H)["status"]
	redisStatus := health["checks"].(gin.H)["redis"].(gin.H)["status"]

	if dbStatus != "ok" || redisStatus != "ok" {
		health["status"] = "degraded"
		c.JSON(http.StatusServiceUnavailable, health)
		return
	}

	c.JSON(http.StatusOK, health)
}

func (s *Server) checkDatabase(ctx context.Context) gin.H {
	sqlDB, err := s.db.DB()
	if err != nil {
		return gin.H{"status": "error", "message": "failed to get database connection"}
	}

	if err := sqlDB.PingContext(ctx); err != nil {
		return gin.H{"status": "error", "message": "database ping failed"}
	}

	return gin.H{"status": "ok"}
}

func (s *Server) checkRedis(ctx context.Context) gin.H {
	_, err := s.redis.Ping(ctx).Result()
	if err != nil {
		return gin.H{"status": "error", "message": "redis ping failed"}
	}

	return gin.H{"status": "ok"}
}

func (s *Server) Run(addr string) error {
	// Start the HTTP server
	server := &http.Server{
		Addr:    addr,
		Handler: s.router,
	}

	// Channel to listen for interrupt signals
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on %s", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	<-quit
	log.Println("Received shutdown signal")

	// Create a context with timeout for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown background workers first
	if err := s.Shutdown(ctx); err != nil {
		log.Printf("Background workers shutdown error: %v", err)
	}

	// Shutdown HTTP server
	log.Println("Shutting down HTTP server...")
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("HTTP server shutdown error: %v", err)
		return err
	}

	log.Println("Server shutdown complete")
	return nil
}

func (s *Server) Shutdown(ctx context.Context) error {
	log.Println("Shutting down background workers...")
	
	// Cancel worker context
	s.workerCancel()
	
	// Wait for workers to finish with timeout
	done := make(chan struct{})
	go func() {
		s.workerWg.Wait()
		close(done)
	}()
	
	select {
	case <-done:
		log.Println("All background workers stopped gracefully")
		return nil
	case <-ctx.Done():
		log.Println("Shutdown timeout reached, forcing exit")
		return ctx.Err()
	}
}