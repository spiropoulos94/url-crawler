package repositories

import (
	"sykell-crawler/internal/models"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestCrawlResultDB(t *testing.T) *gorm.DB {
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

func TestNewCrawlResultRepository(t *testing.T) {
	repo := NewCrawlResultRepository(nil)
	if repo == nil {
		t.Error("Expected non-nil repo")
	}
}

func TestCrawlResultRepository_Create(t *testing.T) {
	db := setupTestCrawlResultDB(t)
	repo := NewCrawlResultRepository(db)

	result := &models.CrawlResult{
		URLID:         1,
		Title:         "Test Page",
		HTMLVersion:   "HTML5",
		H1Count:       2,
		H2Count:       3,
		InternalLinks: 5,
		ExternalLinks: 3,
		BrokenLinks:   1,
		HasLoginForm:  true,
	}

	err := repo.Create(result)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if result.ID == 0 {
		t.Error("Expected result ID to be set after creation")
	}
}

func TestCrawlResultRepository_GetByURLID(t *testing.T) {
	db := setupTestCrawlResultDB(t)
	repo := NewCrawlResultRepository(db)

	result := &models.CrawlResult{
		URLID:         1,
		Title:         "Test Page",
		HTMLVersion:   "HTML5",
		H1Count:       2,
		H2Count:       3,
		InternalLinks: 5,
		ExternalLinks: 3,
		BrokenLinks:   1,
		HasLoginForm:  true,
	}
	repo.Create(result)

	retrieved, err := repo.GetByURLID(1)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if retrieved.Title != result.Title {
		t.Errorf("Expected title '%s', got '%s'", result.Title, retrieved.Title)
	}

	if retrieved.H1Count != result.H1Count {
		t.Errorf("Expected H1 count %d, got %d", result.H1Count, retrieved.H1Count)
	}

	if retrieved.HasLoginForm != result.HasLoginForm {
		t.Errorf("Expected login form %t, got %t", result.HasLoginForm, retrieved.HasLoginForm)
	}
}

func TestCrawlResultRepository_GetByURLID_NotFound(t *testing.T) {
	db := setupTestCrawlResultDB(t)
	repo := NewCrawlResultRepository(db)

	_, err := repo.GetByURLID(999)
	if err == nil {
		t.Error("Expected error for non-existent URL ID")
	}
}

func TestCrawlResultRepository_Update(t *testing.T) {
	db := setupTestCrawlResultDB(t)
	repo := NewCrawlResultRepository(db)

	result := &models.CrawlResult{
		URLID:         1,
		Title:         "Original Title",
		HTMLVersion:   "HTML5",
		H1Count:       2,
		InternalLinks: 5,
		ExternalLinks: 3,
	}
	repo.Create(result)

	result.Title = "Updated Title"
	result.H1Count = 5
	err := repo.Update(result)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	retrieved, _ := repo.GetByURLID(1)
	if retrieved.Title != "Updated Title" {
		t.Errorf("Expected title to be updated to 'Updated Title', got '%s'", retrieved.Title)
	}
	if retrieved.H1Count != 5 {
		t.Errorf("Expected H1 count to be updated to 5, got %d", retrieved.H1Count)
	}
}

func TestCrawlResultRepository_Upsert_Create(t *testing.T) {
	db := setupTestCrawlResultDB(t)
	repo := NewCrawlResultRepository(db)

	result := &models.CrawlResult{
		URLID:         1,
		Title:         "Test Page",
		HTMLVersion:   "HTML5",
		H1Count:       2,
		InternalLinks: 5,
		ExternalLinks: 3,
	}

	err := repo.Upsert(result)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	retrieved, err := repo.GetByURLID(1)
	if err != nil {
		t.Errorf("Expected no error retrieving upserted result, got %v", err)
	}

	if retrieved.Title != result.Title {
		t.Errorf("Expected title '%s', got '%s'", result.Title, retrieved.Title)
	}
}

func TestCrawlResultRepository_Upsert_Update(t *testing.T) {
	db := setupTestCrawlResultDB(t)
	repo := NewCrawlResultRepository(db)

	originalResult := &models.CrawlResult{
		URLID:         1,
		Title:         "Original Title",
		HTMLVersion:   "HTML5",
		H1Count:       2,
		InternalLinks: 5,
		ExternalLinks: 3,
	}
	repo.Create(originalResult)

	newResult := &models.CrawlResult{
		URLID:         1,
		Title:         "Updated Title",
		HTMLVersion:   "HTML5",
		H1Count:       5,
		InternalLinks: 8,
		ExternalLinks: 2,
	}

	err := repo.Upsert(newResult)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	retrieved, err := repo.GetByURLID(1)
	if err != nil {
		t.Errorf("Expected no error retrieving upserted result, got %v", err)
	}

	if retrieved.Title != "Updated Title" {
		t.Errorf("Expected title to be updated to 'Updated Title', got '%s'", retrieved.Title)
	}
	if retrieved.H1Count != 5 {
		t.Errorf("Expected H1 count to be updated to 5, got %d", retrieved.H1Count)
	}
	if retrieved.InternalLinks != 8 {
		t.Errorf("Expected internal links to be updated to 8, got %d", retrieved.InternalLinks)
	}
}

func TestCrawlResultRepository_UpsertWithBrokenURLs(t *testing.T) {
	db := setupTestCrawlResultDB(t)
	repo := NewCrawlResultRepository(db)

	originalResult := &models.CrawlResult{
		URLID:       1,
		Title:       "Test Page",
		BrokenLinks: 2,
		BrokenURLs: []models.BrokenURL{
			{URL: "https://broken1.com", StatusCode: 404},
			{URL: "https://broken2.com", StatusCode: 500},
		},
	}
	repo.Create(originalResult)

	newResult := &models.CrawlResult{
		URLID:       1,
		Title:       "Updated Test Page",
		BrokenLinks: 1,
		BrokenURLs: []models.BrokenURL{
			{URL: "https://newbroken.com", StatusCode: 404, ErrorMessage: "Not Found"},
		},
	}

	err := repo.Upsert(newResult)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	retrieved, err := repo.GetByURLID(1)
	if err != nil {
		t.Errorf("Expected no error retrieving result, got %v", err)
	}

	if retrieved.BrokenLinks != 1 {
		t.Errorf("Expected broken links count to be 1, got %d", retrieved.BrokenLinks)
	}

	if len(retrieved.BrokenURLs) != 1 {
		t.Errorf("Expected 1 broken URL, got %d", len(retrieved.BrokenURLs))
	}

	if retrieved.BrokenURLs[0].URL != "https://newbroken.com" {
		t.Errorf("Expected broken URL 'https://newbroken.com', got '%s'", retrieved.BrokenURLs[0].URL)
	}
}

func TestCrawlResultRepository_Delete(t *testing.T) {
	db := setupTestCrawlResultDB(t)
	repo := NewCrawlResultRepository(db)

	result := &models.CrawlResult{
		URLID:         1,
		Title:         "Test Page",
		HTMLVersion:   "HTML5",
		H1Count:       2,
		InternalLinks: 5,
		ExternalLinks: 3,
	}
	repo.Create(result)

	err := repo.Delete(result.ID)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	_, err = repo.GetByURLID(1)
	if err == nil {
		t.Error("Expected error when retrieving deleted result")
	}
}

func TestCrawlResultRepository_GetLatestByURLID(t *testing.T) {
	db := setupTestCrawlResultDB(t)
	repo := NewCrawlResultRepository(db)

	result1 := &models.CrawlResult{
		URLID: 1,
		Title: "First Result",
	}
	repo.Create(result1)

	latest, err := repo.GetLatestByURLID(1)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if latest.Title != "First Result" {
		t.Errorf("Expected latest result title 'First Result', got '%s'", latest.Title)
	}
}