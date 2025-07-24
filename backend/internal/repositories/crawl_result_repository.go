package repositories

import (
	"sykell-crawler/internal/models"

	"gorm.io/gorm"
)

type CrawlResultRepository interface {
	Create(result *models.CrawlResult) error
	GetByURLID(urlID uint) (*models.CrawlResult, error)
	GetLatestByURLID(urlID uint) (*models.CrawlResult, error)
	Update(result *models.CrawlResult) error
	Upsert(result *models.CrawlResult) error
	Delete(id uint) error
}

type crawlResultRepository struct {
	db *gorm.DB
}

func NewCrawlResultRepository(db *gorm.DB) CrawlResultRepository {
	return &crawlResultRepository{db: db}
}

func (r *crawlResultRepository) Create(result *models.CrawlResult) error {
	return r.db.Create(result).Error
}

func (r *crawlResultRepository) GetByURLID(urlID uint) (*models.CrawlResult, error) {
	var result models.CrawlResult
	err := r.db.Preload("BrokenURLs").Where("url_id = ?", urlID).First(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *crawlResultRepository) GetLatestByURLID(urlID uint) (*models.CrawlResult, error) {
	var result models.CrawlResult
	err := r.db.Preload("BrokenURLs").
		Where("url_id = ?", urlID).
		Order("created_at DESC").
		First(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *crawlResultRepository) Update(result *models.CrawlResult) error {
	return r.db.Save(result).Error
}

func (r *crawlResultRepository) Upsert(result *models.CrawlResult) error {
	// Check if a result already exists for this URL
	var existing models.CrawlResult
	err := r.db.Where("url_id = ?", result.URLID).First(&existing).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// No existing result, create new one
			return r.db.Create(result).Error
		}
		return err
	}
	
	// Delete old broken URLs before updating
	if err := r.db.Where("crawl_result_id = ?", existing.ID).Delete(&models.BrokenURL{}).Error; err != nil {
		return err
	}
	
	// Update existing result with new data
	result.ID = existing.ID // Keep the same ID
	
	// Update the crawl result and create new broken URLs
	return r.db.Save(result).Error
}

func (r *crawlResultRepository) Delete(id uint) error {
	return r.db.Delete(&models.CrawlResult{}, id).Error
}