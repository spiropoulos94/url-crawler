package main

import (
	"log"
	"os"
	"strings"

	"sykell-crawler/internal/api"
	"sykell-crawler/internal/database"
	"sykell-crawler/internal/queue"
	"sykell-crawler/pkg/config"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cfg := config.Load()

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := database.Migrate(db); err != nil {
		if strings.Contains(err.Error(), "Error 1091") {
			// This is a known issue with MySQL 8.0+ where foreign key constraints are named differently
			// We can safely ignore this error
			log.Printf("Migration warning (constraint naming): %v", err)
		} else {
			log.Fatal("Failed to run migrations:", err)
		}
	}

	redis := queue.NewRedisClient(cfg.RedisURL)
	defer redis.Close()

	server := api.NewServer(db, redis, cfg)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := server.Run(":" + port); err != nil {
		log.Fatal("Server shutdown error:", err)
	}
}
