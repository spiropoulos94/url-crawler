package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sykell-crawler/internal/models"
	"sykell-crawler/internal/services"
	"testing"

	"github.com/gin-gonic/gin"
)

type mockURLService struct {
	urls    map[uint]*models.URL
	nextID  uint
	failGet bool
	failAdd bool
}

func (m *mockURLService) AddURL(url string) (*services.AddURLResult, error) {
	if m.failAdd {
		return nil, errors.New("failed to add URL")
	}
	m.nextID++
	newURL := &models.URL{
		ID:     m.nextID,
		URL:    url,
		Status: models.StatusQueued,
	}
	m.urls[m.nextID] = newURL
	return &services.AddURLResult{
		URL:     newURL,
		Message: "URL added successfully",
		IsNew:   true,
	}, nil
}

func (m *mockURLService) GetURL(id uint) (*models.URL, error) {
	if m.failGet {
		return nil, errors.New("URL not found")
	}
	if url, exists := m.urls[id]; exists {
		return url, nil
	}
	return nil, errors.New("URL not found")
}

func (m *mockURLService) GetAllURLs(page, limit int, search, sortBy, sortOrder string) ([]*models.URL, int64, error) {
	var urls []*models.URL
	for _, url := range m.urls {
		urls = append(urls, url)
	}
	return urls, int64(len(urls)), nil
}

func (m *mockURLService) StopCrawling(ids []uint) error {
	return nil
}

func (m *mockURLService) DeleteURLs(ids []uint) error {
	for _, id := range ids {
		delete(m.urls, id)
	}
	return nil
}

func (m *mockURLService) StartCrawling(ids []uint) error {
	return nil
}

func (m *mockURLService) RecrawlURLs(ids []uint) error {
	return nil
}

func TestNewURLHandler(t *testing.T) {
	handler := NewURLHandler(nil)
	if handler == nil {
		t.Error("Expected non-nil handler")
	}
}

func TestAddURL_Success(t *testing.T) {
	mockService := &mockURLService{
		urls: make(map[uint]*models.URL),
	}
	handler := NewURLHandler(mockService)

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/urls", handler.AddURL)

	reqBody := AddURLRequest{URL: "https://example.com"}
	jsonBody, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/urls", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status %d, got %d", http.StatusCreated, w.Code)
	}

	var response services.AddURLResult
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("Failed to unmarshal response: %v", err)
	}

	if response.URL.URL != "https://example.com" {
		t.Errorf("Expected URL 'https://example.com', got '%s'", response.URL.URL)
	}

	if response.URL.Status != models.StatusQueued {
		t.Errorf("Expected status '%s', got '%s'", models.StatusQueued, response.URL.Status)
	}

	if !response.IsNew {
		t.Error("Expected IsNew to be true")
	}
}

func TestAddURL_InvalidRequest(t *testing.T) {
	mockService := &mockURLService{
		urls: make(map[uint]*models.URL),
	}
	handler := NewURLHandler(mockService)

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/urls", handler.AddURL)

	// Test with empty body
	req := httptest.NewRequest(http.MethodPost, "/urls", bytes.NewReader([]byte("{}")))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestAddURL_ServiceError(t *testing.T) {
	mockService := &mockURLService{
		urls:    make(map[uint]*models.URL),
		failAdd: true,
	}
	handler := NewURLHandler(mockService)

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/urls", handler.AddURL)

	reqBody := AddURLRequest{URL: "https://example.com"}
	jsonBody, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/urls", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestGetURL_Success(t *testing.T) {
	testURL := &models.URL{
		ID:     1,
		URL:    "https://example.com",
		Status: models.StatusDone,
		Title:  "Example Site",
	}
	
	mockService := &mockURLService{
		urls: map[uint]*models.URL{
			1: testURL,
		},
	}
	handler := NewURLHandler(mockService)

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/urls/:id", handler.GetURL)

	req := httptest.NewRequest(http.MethodGet, "/urls/1", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	var response models.URL
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("Failed to unmarshal response: %v", err)
	}

	if response.URL != testURL.URL {
		t.Errorf("Expected URL '%s', got '%s'", testURL.URL, response.URL)
	}

	if response.Title != testURL.Title {
		t.Errorf("Expected title '%s', got '%s'", testURL.Title, response.Title)
	}
}

func TestGetURL_InvalidID(t *testing.T) {
	mockService := &mockURLService{
		urls: make(map[uint]*models.URL),
	}
	handler := NewURLHandler(mockService)

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/urls/:id", handler.GetURL)

	req := httptest.NewRequest(http.MethodGet, "/urls/invalid", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestGetURL_NotFound(t *testing.T) {
	mockService := &mockURLService{
		urls:    make(map[uint]*models.URL),
		failGet: true,
	}
	handler := NewURLHandler(mockService)

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/urls/:id", handler.GetURL)

	req := httptest.NewRequest(http.MethodGet, "/urls/999", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status %d, got %d", http.StatusNotFound, w.Code)
	}
}
