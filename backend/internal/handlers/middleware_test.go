package handlers

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"sykell-crawler/internal/models"
	"sykell-crawler/pkg/config"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

type mockAuthService struct {
	validToken   bool
	returnClaims *jwt.MapClaims
}

func (m *mockAuthService) Register(username, password string) (*models.User, error) {
	return nil, nil
}

func (m *mockAuthService) Login(username, password string) (string, *models.User, error) {
	return "", nil, nil
}

func (m *mockAuthService) ValidateToken(tokenString string) (*jwt.MapClaims, error) {
	if !m.validToken {
		return nil, errors.New("invalid token")
	}
	if m.returnClaims != nil {
		return m.returnClaims, nil
	}
	claims := jwt.MapClaims{
		"user_id":  float64(1),
		"username": "testuser",
	}
	return &claims, nil
}

func TestAuthMiddleware_ValidTokenFromCookie(t *testing.T) {
	claims := jwt.MapClaims{
		"user_id":  float64(1),
		"username": "testuser",
	}
	mockService := &mockAuthService{
		validToken:   true,
		returnClaims: &claims,
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthMiddleware(mockService))
	router.GET("/protected", func(c *gin.Context) {
		userID := c.GetFloat64("user_id")
		username := c.GetString("username")
		c.JSON(http.StatusOK, gin.H{
			"user_id":  userID,
			"username": username,
		})
	})

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.AddCookie(&http.Cookie{
		Name:  "auth_token",
		Value: "valid_token",
	})
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestAuthMiddleware_ValidTokenFromHeader(t *testing.T) {
	claims := jwt.MapClaims{
		"user_id":  float64(1),
		"username": "testuser",
	}
	mockService := &mockAuthService{
		validToken:   true,
		returnClaims: &claims,
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthMiddleware(mockService))
	router.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer valid_token")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestAuthMiddleware_NoToken(t *testing.T) {
	mockService := &mockAuthService{validToken: true}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthMiddleware(mockService))
	router.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

func TestAuthMiddleware_InvalidAuthorizationFormat(t *testing.T) {
	mockService := &mockAuthService{validToken: true}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthMiddleware(mockService))
	router.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	testCases := []struct {
		name   string
		header string
	}{
		{"No Bearer prefix", "invalid_token"},
		{"Wrong prefix", "Basic dGVzdA=="},
		{"Missing token", "Bearer"},
		{"Too many parts", "Bearer token extra"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/protected", nil)
			req.Header.Set("Authorization", tc.header)
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			if w.Code != http.StatusUnauthorized {
				t.Errorf("Expected status %d for '%s', got %d", http.StatusUnauthorized, tc.header, w.Code)
			}
		})
	}
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	mockService := &mockAuthService{validToken: false}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(AuthMiddleware(mockService))
	router.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer invalid_token")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

func TestCORSMiddleware_AllowedOrigin(t *testing.T) {
	cfg := &config.Config{
		AllowedOrigins: []string{"http://localhost:3000", "https://example.com"},
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(CORSMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	allowOrigin := w.Header().Get("Access-Control-Allow-Origin")
	if allowOrigin != "http://localhost:3000" {
		t.Errorf("Expected Allow-Origin 'http://localhost:3000', got '%s'", allowOrigin)
	}

	allowCredentials := w.Header().Get("Access-Control-Allow-Credentials")
	if allowCredentials != "true" {
		t.Errorf("Expected Allow-Credentials 'true', got '%s'", allowCredentials)
	}
}

func TestCORSMiddleware_DisallowedOrigin(t *testing.T) {
	cfg := &config.Config{
		AllowedOrigins: []string{"http://localhost:3000"},
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(CORSMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Origin", "https://malicious.com")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	allowOrigin := w.Header().Get("Access-Control-Allow-Origin")
	if allowOrigin != "" {
		t.Errorf("Expected no Allow-Origin header for disallowed origin, got '%s'", allowOrigin)
	}
}

func TestCORSMiddleware_OptionsRequest(t *testing.T) {
	cfg := &config.Config{
		AllowedOrigins: []string{"http://localhost:3000"},
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(CORSMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	req := httptest.NewRequest(http.MethodOptions, "/test", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != 204 {
		t.Errorf("Expected status 204 for OPTIONS request, got %d", w.Code)
	}

	allowMethods := w.Header().Get("Access-Control-Allow-Methods")
	if allowMethods == "" {
		t.Error("Expected Allow-Methods header to be set")
	}

	allowHeaders := w.Header().Get("Access-Control-Allow-Headers")
	if allowHeaders == "" {
		t.Error("Expected Allow-Headers header to be set")
	}
}

func TestCORSMiddleware_NoOrigin(t *testing.T) {
	cfg := &config.Config{
		AllowedOrigins: []string{"http://localhost:3000"},
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(CORSMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	allowOrigin := w.Header().Get("Access-Control-Allow-Origin")
	if allowOrigin != "" {
		t.Errorf("Expected no Allow-Origin header when no origin provided, got '%s'", allowOrigin)
	}

	allowCredentials := w.Header().Get("Access-Control-Allow-Credentials")
	if allowCredentials != "true" {
		t.Errorf("Expected Allow-Credentials 'true', got '%s'", allowCredentials)
	}
}