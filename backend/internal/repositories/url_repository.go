package repositories

import (
	"sykell-crawler/internal/models"

	"gorm.io/gorm"
)

type URLRepository interface {
	Create(url *models.URL) error
	GetByID(id uint) (*models.URL, error)
	GetByURL(url string) (*models.URL, error)
	GetDeletedByURL(url string) (*models.URL, error)
	RestoreURL(id uint) error
	GetAll(offset, limit int, search string) ([]*models.URL, int64, error)
	Update(url *models.URL) error
	Delete(id uint) error
	UpdateStatus(id uint, status models.CrawlStatus) error
	GetByIDs(ids []uint) ([]*models.URL, error)
}

type urlRepository struct {
	db *gorm.DB
}

func NewURLRepository(db *gorm.DB) URLRepository {
	return &urlRepository{db: db}
}

func (r *urlRepository) Create(url *models.URL) error {
	return r.db.Create(url).Error
}

func (r *urlRepository) GetByID(id uint) (*models.URL, error) {
	var url models.URL
	err := r.db.Preload("Results.BrokenURLs").First(&url, id).Error
	if err != nil {
		return nil, err
	}
	return &url, nil
}

func (r *urlRepository) GetByURL(urlStr string) (*models.URL, error) {
	var url models.URL
	err := r.db.Where("url = ?", urlStr).First(&url).Error
	if err != nil {
		return nil, err
	}
	return &url, nil
}

func (r *urlRepository) GetDeletedByURL(urlStr string) (*models.URL, error) {
	var url models.URL
	err := r.db.Unscoped().Where("url = ? AND deleted_at IS NOT NULL", urlStr).First(&url).Error
	if err != nil {
		return nil, err
	}
	return &url, nil
}

func (r *urlRepository) RestoreURL(id uint) error {
	return r.db.Unscoped().Model(&models.URL{}).Where("id = ?", id).Update("deleted_at", nil).Error
}

func (r *urlRepository) GetAll(offset, limit int, search string) ([]*models.URL, int64, error) {
	var urls []*models.URL
	var total int64

	query := r.db.Model(&models.URL{})
	
	if search != "" {
		query = query.Where("url LIKE ? OR title LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Preload("Results").
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(&urls).Error

	return urls, total, err
}

func (r *urlRepository) Update(url *models.URL) error {
	return r.db.Save(url).Error
}

func (r *urlRepository) Delete(id uint) error {
	return r.db.Delete(&models.URL{}, id).Error
}

func (r *urlRepository) UpdateStatus(id uint, status models.CrawlStatus) error {
	return r.db.Model(&models.URL{}).Where("id = ?", id).Update("status", status).Error
}

func (r *urlRepository) GetByIDs(ids []uint) ([]*models.URL, error) {
	var urls []*models.URL
	err := r.db.Where("id IN ?", ids).Find(&urls).Error
	return urls, err
}