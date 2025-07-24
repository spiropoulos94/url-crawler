package services

import (
	"errors"
	"net/url"
	"sykell-crawler/internal/models"
	"sykell-crawler/internal/repositories"
	"strings"

	"gorm.io/gorm"
)

type URLService interface {
	AddURL(urlStr string) (*models.URL, error)
	GetURL(id uint) (*models.URL, error)
	GetAllURLs(page, pageSize int, search, sortBy, sortOrder string) ([]*models.URL, int64, error)
	StartCrawling(ids []uint) error
	StopCrawling(ids []uint) error
	DeleteURLs(ids []uint) error
	RecrawlURLs(ids []uint) error
}

type urlService struct {
	urlRepo repositories.URLRepository
	queue   QueueService
}

func NewURLService(urlRepo repositories.URLRepository, queue QueueService) URLService {
	return &urlService{
		urlRepo: urlRepo,
		queue:   queue,
	}
}

func (s *urlService) AddURL(urlStr string) (*models.URL, error) {
	if !s.isValidURL(urlStr) {
		return nil, errors.New("invalid URL format")
	}

	urlStr = s.normalizeURL(urlStr)

	// First, check for existing active URL
	existing, err := s.urlRepo.GetByURL(urlStr)
	if err == nil {
		return existing, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Check for soft-deleted URL and restore it
	if existingDeleted, err := s.urlRepo.GetDeletedByURL(urlStr); err == nil {
		// Restore the soft-deleted URL
		if err := s.urlRepo.RestoreURL(existingDeleted.ID); err != nil {
			return nil, err
		}
		
		// Update status and enqueue
		if err := s.urlRepo.UpdateStatus(existingDeleted.ID, models.StatusQueued); err != nil {
			return nil, err
		}
		
		if err := s.queue.EnqueueCrawlJob(existingDeleted.ID); err != nil {
			s.urlRepo.UpdateStatus(existingDeleted.ID, models.StatusError)
			return nil, err
		}
		
		// Return the restored URL
		return s.urlRepo.GetByID(existingDeleted.ID)
	}

	// Create new URL if no existing or deleted URL found
	newURL := &models.URL{
		URL:    urlStr,
		Status: models.StatusQueued,
	}

	if err := s.urlRepo.Create(newURL); err != nil {
		return nil, err
	}

	if err := s.queue.EnqueueCrawlJob(newURL.ID); err != nil {
		s.urlRepo.UpdateStatus(newURL.ID, models.StatusError)
		return nil, err
	}

	return newURL, nil
}

func (s *urlService) GetURL(id uint) (*models.URL, error) {
	return s.urlRepo.GetByID(id)
}

func (s *urlService) GetAllURLs(page, pageSize int, search, sortBy, sortOrder string) ([]*models.URL, int64, error) {
	offset := (page - 1) * pageSize
	return s.urlRepo.GetAll(offset, pageSize, search)
}

func (s *urlService) StartCrawling(ids []uint) error {
	urls, err := s.urlRepo.GetByIDs(ids)
	if err != nil {
		return err
	}

	for _, url := range urls {
		if url.Status == models.StatusRunning {
			continue
		}

		if err := s.urlRepo.UpdateStatus(url.ID, models.StatusQueued); err != nil {
			continue
		}

		if err := s.queue.EnqueueCrawlJob(url.ID); err != nil {
			s.urlRepo.UpdateStatus(url.ID, models.StatusError)
		}
	}

	return nil
}

func (s *urlService) StopCrawling(ids []uint) error {
	for _, id := range ids {
		if err := s.urlRepo.UpdateStatus(id, models.StatusDone); err != nil {
			return err
		}
	}
	return nil
}

func (s *urlService) DeleteURLs(ids []uint) error {
	for _, id := range ids {
		if err := s.urlRepo.Delete(id); err != nil {
			return err
		}
	}
	return nil
}

func (s *urlService) RecrawlURLs(ids []uint) error {
	return s.StartCrawling(ids)
}

func (s *urlService) isValidURL(urlStr string) bool {
	u, err := url.Parse(urlStr)
	if err != nil {
		return false
	}
	return u.Scheme != "" && u.Host != ""
}

func (s *urlService) normalizeURL(urlStr string) string {
	if !strings.HasPrefix(urlStr, "http://") && !strings.HasPrefix(urlStr, "https://") {
		urlStr = "https://" + urlStr
	}
	return strings.TrimSuffix(urlStr, "/")
}