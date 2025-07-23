package config

import (
	"os"
)

type Config struct {
	DatabaseURL    string
	RedisURL       string
	JWTSecret      string
	AllowedOrigins []string
}

func Load() *Config {
	return &Config{
		DatabaseURL:    getEnv("DATABASE_URL", "root:password@tcp(localhost:3306)/sykell_crawler?charset=utf8mb4&parseTime=True&loc=Local"),
		RedisURL:       getEnv("REDIS_URL", "localhost:6379"),
		JWTSecret:      getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		AllowedOrigins: []string{getEnv("FRONTEND_URL", "http://localhost:3000")},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}