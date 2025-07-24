package database

import (
	"log"
	"sykell-crawler/internal/models"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(databaseURL string) (*gorm.DB, error) {
	const maxRetries = 10
	const retryDelay = 3 * time.Second
	
	log.Println("Connecting to database...")
	
	for attempt := 1; attempt <= maxRetries; attempt++ {
		db, err := gorm.Open(mysql.Open(databaseURL), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		
		if err == nil {
			log.Println("Successfully connected to database!")
			return db, nil
		}
		
		if attempt < maxRetries {
			log.Printf("Database connection failed (attempt %d/%d): %v", attempt, maxRetries, err)
			log.Printf("Retrying in %v...", retryDelay)
			time.Sleep(retryDelay)
		} else {
			log.Printf("Failed to connect to database after %d attempts: %v", maxRetries, err)
			return nil, err
		}
	}
	
	return nil, nil // This should never be reached
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.URL{},
		&models.CrawlResult{},
		&models.BrokenURL{},
	)
}