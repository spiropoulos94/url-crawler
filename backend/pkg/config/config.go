package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	DatabaseURL       string
	RedisURL          string
	JWTSecret         string
	AllowedOrigins    []string
	HTTPTimeout       time.Duration
	LinkCheckTimeout  time.Duration
}

func Load() *Config {
	cfg := &Config{
		DatabaseURL:      getEnv("DATABASE_URL", "root:password@tcp(localhost:3306)/sykell_crawler?charset=utf8mb4&parseTime=True&loc=Local"),
		RedisURL:         getEnv("REDIS_URL", "localhost:6379"),
		JWTSecret:        getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		AllowedOrigins:   []string{getEnv("FRONTEND_URL", "http://localhost:5173")},
		HTTPTimeout:      getDurationEnv("HTTP_TIMEOUT", 30*time.Second),
		LinkCheckTimeout: getDurationEnv("LINK_CHECK_TIMEOUT", 10*time.Second),
	}

	if err := cfg.validate(); err != nil {
		panic(fmt.Sprintf("Configuration validation failed: %v", err))
	}

	return cfg
}

func (c *Config) validate() error {
	if c.JWTSecret == "your-secret-key-change-in-production" {
		return fmt.Errorf("JWT_SECRET must be set to a secure value")
	}

	if len(c.JWTSecret) < 32 {
		return fmt.Errorf("JWT_SECRET must be at least 32 characters long")
	}

	if c.DatabaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}

	if c.RedisURL == "" {
		return fmt.Errorf("REDIS_URL is required")
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if seconds, err := strconv.Atoi(value); err == nil {
			return time.Duration(seconds) * time.Second
		}
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
