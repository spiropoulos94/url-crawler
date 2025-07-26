package services

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"sykell-crawler/internal/models"
	"testing"
)

type mockURLRepository struct {
	urls     map[uint]*models.URL
	updateID uint
	updateStatus models.CrawlStatus
}

func (m *mockURLRepository) Create(url *models.URL) error {
	return nil
}

func (m *mockURLRepository) GetByID(id uint) (*models.URL, error) {
	if url, exists := m.urls[id]; exists {
		return url, nil
	}
	return nil, errors.New("url not found")
}

func (m *mockURLRepository) UpdateStatus(id uint, status models.CrawlStatus) error {
	m.updateID = id
	m.updateStatus = status
	if url, exists := m.urls[id]; exists {
		url.Status = status
	}
	return nil
}

func (m *mockURLRepository) Update(url *models.URL) error {
	if _, exists := m.urls[url.ID]; exists {
		m.urls[url.ID] = url
	}
	return nil
}

func (m *mockURLRepository) GetByURL(url string) (*models.URL, error) {
	return nil, errors.New("not implemented")
}

func (m *mockURLRepository) GetDeletedByURL(url string) (*models.URL, error) {
	return nil, errors.New("not implemented")
}

func (m *mockURLRepository) RestoreURL(id uint) error {
	return nil
}

func (m *mockURLRepository) GetAll(offset, limit int, search, sortBy, sortOrder string) ([]*models.URL, int64, error) {
	return nil, 0, nil
}

func (m *mockURLRepository) GetByIDs(ids []uint) ([]*models.URL, error) {
	return nil, nil
}

func (m *mockURLRepository) Delete(id uint) error {
	delete(m.urls, id)
	return nil
}

type mockCrawlResultRepository struct {
	results map[uint]*models.CrawlResult
}

func (m *mockCrawlResultRepository) Create(result *models.CrawlResult) error {
	return nil
}

func (m *mockCrawlResultRepository) GetByURLID(urlID uint) (*models.CrawlResult, error) {
	if result, exists := m.results[urlID]; exists {
		return result, nil
	}
	return nil, errors.New("result not found")
}

func (m *mockCrawlResultRepository) GetLatestByURLID(urlID uint) (*models.CrawlResult, error) {
	return m.GetByURLID(urlID)
}

func (m *mockCrawlResultRepository) Update(result *models.CrawlResult) error {
	return nil
}

func (m *mockCrawlResultRepository) Upsert(result *models.CrawlResult) error {
	m.results[result.URLID] = result
	return nil
}

func (m *mockCrawlResultRepository) Delete(id uint) error {
	return nil
}

type mockQueueService struct {
	cancelled bool
}

func (m *mockQueueService) EnqueueCrawlJob(urlID uint) error {
	return nil
}

func (m *mockQueueService) ProcessCrawlJobs(ctx context.Context, crawlerService CrawlerService) error {
	return nil
}

func (m *mockQueueService) CancelCrawlJob(urlID uint) error {
	return nil
}

func (m *mockQueueService) ClearCancellation(urlID uint) error {
	return nil
}

func (m *mockQueueService) IsCancelled(urlID uint) (bool, error) {
	return m.cancelled, nil
}

func TestNewCrawlerService(t *testing.T) {
	urlRepo := &mockURLRepository{}
	resultRepo := &mockCrawlResultRepository{}
	queue := &mockQueueService{}
	
	service := NewCrawlerService(urlRepo, resultRepo, queue)
	if service == nil {
		t.Error("Expected non-nil service")
	}
}

func TestCrawlURL_Success(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`
			<!DOCTYPE html>
			<html>
			<head><title>Test Page</title></head>
			<body>
				<h1>Main Title</h1>
				<h2>Subtitle</h2>
				<a href="/internal">Internal Link</a>
				<a href="https://external.com">External Link</a>
			</body>
			</html>
		`))
	}))
	defer server.Close()

	urlRepo := &mockURLRepository{
		urls: map[uint]*models.URL{
			1: {
				ID:  1,
				URL: server.URL,
				Status: models.StatusQueued,
			},
		},
	}
	resultRepo := &mockCrawlResultRepository{
		results: make(map[uint]*models.CrawlResult),
	}
	queue := &mockQueueService{cancelled: false}

	service := NewCrawlerService(urlRepo, resultRepo, queue)
	err := service.CrawlURL(1)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if urlRepo.updateStatus != models.StatusRunning {
		t.Errorf("Expected status to be updated to running")
	}

	result, exists := resultRepo.results[1]
	if !exists {
		t.Error("Expected crawl result to be saved")
	}

	if result.Title != "Test Page" {
		t.Errorf("Expected title 'Test Page', got '%s'", result.Title)
	}

	if result.H1Count != 1 {
		t.Errorf("Expected 1 H1 tag, got %d", result.H1Count)
	}

	if result.H2Count != 1 {
		t.Errorf("Expected 1 H2 tag, got %d", result.H2Count)
	}
}

func TestCrawlURL_URLNotFound(t *testing.T) {
	urlRepo := &mockURLRepository{
		urls: make(map[uint]*models.URL),
	}
	resultRepo := &mockCrawlResultRepository{
		results: make(map[uint]*models.CrawlResult),
	}
	queue := &mockQueueService{}

	service := NewCrawlerService(urlRepo, resultRepo, queue)
	err := service.CrawlURL(999)

	if err == nil {
		t.Error("Expected error for non-existent URL")
	}
}

func TestCrawlURL_Cancelled(t *testing.T) {
	urlRepo := &mockURLRepository{
		urls: map[uint]*models.URL{
			1: {
				ID:  1,
				URL: "http://example.com",
				Status: models.StatusQueued,
			},
		},
	}
	resultRepo := &mockCrawlResultRepository{
		results: make(map[uint]*models.CrawlResult),
	}
	queue := &mockQueueService{cancelled: true}

	service := NewCrawlerService(urlRepo, resultRepo, queue)
	err := service.CrawlURL(1)

	if err != nil {
		t.Errorf("Expected no error for cancelled job, got %v", err)
	}

	if urlRepo.updateStatus != models.StatusStopped {
		t.Errorf("Expected status to be updated to stopped, got %v", urlRepo.updateStatus)
	}
}

func TestCrawlURL_HTTPError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	}))
	defer server.Close()

	urlRepo := &mockURLRepository{
		urls: map[uint]*models.URL{
			1: {
				ID:  1,
				URL: server.URL,
				Status: models.StatusQueued,
			},
		},
	}
	resultRepo := &mockCrawlResultRepository{
		results: make(map[uint]*models.CrawlResult),
	}
	queue := &mockQueueService{cancelled: false}

	service := NewCrawlerService(urlRepo, resultRepo, queue)
	err := service.CrawlURL(1)

	if err != nil {
		t.Errorf("Expected no error (should handle HTTP errors gracefully), got %v", err)
	}

	url := urlRepo.urls[1]
	if url.Status != models.StatusError {
		t.Errorf("Expected URL status to be error, got %v", url.Status)
	}

	if url.ErrorMessage == "" {
		t.Error("Expected error message to be set")
	}

	result, exists := resultRepo.results[1]
	if !exists {
		t.Error("Expected crawl result to be saved even on error")
	}

	if result.ErrorMessage == "" {
		t.Error("Expected result error message to be set")
	}
}
