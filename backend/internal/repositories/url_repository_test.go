package repositories

import (
	"sykell-crawler/internal/models"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to create in-memory database: %v", err)
	}

	err = db.AutoMigrate(&models.URL{}, &models.CrawlResult{}, &models.BrokenURL{})
	if err != nil {
		t.Fatalf("Failed to migrate tables: %v", err)
	}

	return db
}

func TestNewURLRepository(t *testing.T) {
	repo := NewURLRepository(nil)
	if repo == nil {
		t.Error("Expected non-nil repo")
	}
}

func TestURLRepository_Create(t *testing.T) {
	db := setupTestDB(t)
	repo := NewURLRepository(db)

	url := &models.URL{
		URL:    "https://example.com",
		Status: models.StatusQueued,
	}

	err := repo.Create(url)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if url.ID == 0 {
		t.Error("Expected URL ID to be set after creation")
	}
}

func TestURLRepository_GetByID(t *testing.T) {
	db := setupTestDB(t)
	repo := NewURLRepository(db)

	url := &models.URL{
		URL:    "https://example.com",
		Status: models.StatusQueued,
	}
	repo.Create(url)

	retrieved, err := repo.GetByID(url.ID)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if retrieved.URL != url.URL {
		t.Errorf("Expected URL '%s', got '%s'", url.URL, retrieved.URL)
	}

	if retrieved.Status != url.Status {
		t.Errorf("Expected status '%s', got '%s'", url.Status, retrieved.Status)
	}
}

func TestURLRepository_GetByID_NotFound(t *testing.T) {
	db := setupTestDB(t)
	repo := NewURLRepository(db)

	_, err := repo.GetByID(999)
	if err == nil {
		t.Error("Expected error for non-existent URL")
	}
}

func TestURLRepository_UpdateStatus(t *testing.T) {
	db := setupTestDB(t)
	repo := NewURLRepository(db)

	url := &models.URL{
		URL:    "https://example.com",
		Status: models.StatusQueued,
	}
	repo.Create(url)

	err := repo.UpdateStatus(url.ID, models.StatusRunning)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	retrieved, _ := repo.GetByID(url.ID)
	if retrieved.Status != models.StatusRunning {
		t.Errorf("Expected status to be updated to '%s', got '%s'", models.StatusRunning, retrieved.Status)
	}
}

func TestURLRepository_Update(t *testing.T) {
	db := setupTestDB(t)
	repo := NewURLRepository(db)

	url := &models.URL{
		URL:    "https://example.com",
		Status: models.StatusQueued,
		Title:  "Original Title",
	}
	repo.Create(url)

	url.Title = "Updated Title"
	url.Status = models.StatusDone
	err := repo.Update(url)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	retrieved, _ := repo.GetByID(url.ID)
	if retrieved.Title != "Updated Title" {
		t.Errorf("Expected title to be updated to 'Updated Title', got '%s'", retrieved.Title)
	}
	if retrieved.Status != models.StatusDone {
		t.Errorf("Expected status to be updated to '%s', got '%s'", models.StatusDone, retrieved.Status)
	}
}

func TestURLRepository_Delete(t *testing.T) {
	db := setupTestDB(t)
	repo := NewURLRepository(db)

	url := &models.URL{
		URL:    "https://example.com",
		Status: models.StatusQueued,
	}
	repo.Create(url)

	err := repo.Delete(url.ID)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	_, err = repo.GetByID(url.ID)
	if err == nil {
		t.Error("Expected error when retrieving deleted URL")
	}
}

func TestURLRepository_GetAll(t *testing.T) {
	db := setupTestDB(t)
	repo := NewURLRepository(db)

	urls := []*models.URL{
		{URL: "https://example1.com", Status: models.StatusQueued},
		{URL: "https://example2.com", Status: models.StatusDone},
		{URL: "https://example3.com", Status: models.StatusError},
	}

	for _, url := range urls {
		repo.Create(url)
	}

	retrieved, total, err := repo.GetAll(0, 10, "", "created_at", "desc")
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if total != 3 {
		t.Errorf("Expected total count of 3, got %d", total)
	}

	if len(retrieved) != 3 {
		t.Errorf("Expected 3 URLs, got %d", len(retrieved))
	}
}

func TestURLRepository_GetAll_WithSearch(t *testing.T) {
	db := setupTestDB(t)
	repo := NewURLRepository(db)

	urls := []*models.URL{
		{URL: "https://example.com", Status: models.StatusQueued, Title: "Example Site"},
		{URL: "https://test.com", Status: models.StatusDone, Title: "Test Site"},
		{URL: "https://another.com", Status: models.StatusError, Title: "Another Site"},
	}

	for _, url := range urls {
		repo.Create(url)
	}

	retrieved, total, err := repo.GetAll(0, 10, "example", "created_at", "desc")
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if total != 1 {
		t.Errorf("Expected total count of 1, got %d", total)
	}

	if len(retrieved) != 1 {
		t.Errorf("Expected 1 URL, got %d", len(retrieved))
	}

	if retrieved[0].URL != "https://example.com" {
		t.Errorf("Expected URL 'https://example.com', got '%s'", retrieved[0].URL)
	}
}
