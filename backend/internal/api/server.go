package api

import (
	"context"
	"log"
	"sykell-crawler/internal/handlers"
	"sykell-crawler/internal/repositories"
	"sykell-crawler/internal/services"
	"sykell-crawler/pkg/config"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type Server struct {
	router *gin.Engine
	db     *gorm.DB
	redis  *redis.Client
	config *config.Config
}

func NewServer(db *gorm.DB, redis *redis.Client, cfg *config.Config) *Server {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(handlers.CORSMiddleware())

	s := &Server{
		router: router,
		db:     db,
		redis:  redis,
		config: cfg,
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

	s.router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}

func (s *Server) startBackgroundWorkers() {
	urlRepo := repositories.NewURLRepository(s.db)
	resultRepo := repositories.NewCrawlResultRepository(s.db)

	queueService := services.NewQueueService(s.redis)
	crawlerService := services.NewCrawlerService(urlRepo, resultRepo, queueService)

	go func() {
		log.Println("Starting background crawler worker...")
		if err := queueService.ProcessCrawlJobs(context.Background(), crawlerService); err != nil {
			log.Printf("Crawler worker error: %v", err)
		}
	}()
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}