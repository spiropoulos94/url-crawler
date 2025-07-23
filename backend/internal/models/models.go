package models

import (
	"time"

	"gorm.io/gorm"
)

type CrawlStatus string

const (
	StatusQueued  CrawlStatus = "queued"
	StatusRunning CrawlStatus = "running"
	StatusDone    CrawlStatus = "done"
	StatusError   CrawlStatus = "error"
)

type URL struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	URL       string         `json:"url" gorm:"unique;not null;index"`
	Title     string         `json:"title"`
	Status    CrawlStatus    `json:"status" gorm:"default:queued"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Results   []CrawlResult  `json:"results,omitempty" gorm:"foreignKey:URLID"`
}

type CrawlResult struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	URLID          uint           `json:"url_id" gorm:"not null;index"`
	HTMLVersion    string         `json:"html_version"`
	Title          string         `json:"title"`
	H1Count        int            `json:"h1_count"`
	H2Count        int            `json:"h2_count"`
	H3Count        int            `json:"h3_count"`
	H4Count        int            `json:"h4_count"`
	H5Count        int            `json:"h5_count"`
	H6Count        int            `json:"h6_count"`
	InternalLinks  int            `json:"internal_links"`
	ExternalLinks  int            `json:"external_links"`
	BrokenLinks    int            `json:"broken_links"`
	HasLoginForm   bool           `json:"has_login_form"`
	ErrorMessage   string         `json:"error_message,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
	BrokenURLs     []BrokenURL    `json:"broken_urls,omitempty" gorm:"foreignKey:CrawlResultID"`
}

type BrokenURL struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	CrawlResultID  uint           `json:"crawl_result_id" gorm:"not null;index"`
	URL            string         `json:"url" gorm:"not null"`
	StatusCode     int            `json:"status_code"`
	ErrorMessage   string         `json:"error_message,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"unique;not null"`
	Password  string         `json:"-" gorm:"not null"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}