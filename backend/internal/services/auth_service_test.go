package services

import (
	"sykell-crawler/internal/models"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type mockUserRepository struct {
	users map[string]*models.User
	nextID uint
}

func (m *mockUserRepository) Create(user *models.User) error {
	m.nextID++
	user.ID = m.nextID
	// Create a copy to store in the mock
	storedUser := &models.User{
		ID:       user.ID,
		Username: user.Username,
		Password: user.Password,
	}
	m.users[user.Username] = storedUser
	return nil
}

func (m *mockUserRepository) GetByUsername(username string) (*models.User, error) {
	if user, exists := m.users[username]; exists {
		return user, nil
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockUserRepository) GetByID(id uint) (*models.User, error) {
	return nil, gorm.ErrRecordNotFound
}

func (m *mockUserRepository) Update(user *models.User) error {
	return nil
}

func (m *mockUserRepository) Delete(id uint) error {
	return nil
}

func TestNewAuthService(t *testing.T) {
	userRepo := &mockUserRepository{
		users: make(map[string]*models.User),
	}
	jwtSecret := "test-secret-key-that-is-long-enough"

	service := NewAuthService(userRepo, jwtSecret)
	if service == nil {
		t.Error("Expected non-nil service")
	}
}

func TestRegister_Success(t *testing.T) {
	userRepo := &mockUserRepository{
		users: make(map[string]*models.User),
	}
	service := NewAuthService(userRepo, "test-secret-key-that-is-long-enough")

	user, err := service.Register("testuser", "password123")

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if user == nil {
		t.Error("Expected user to be returned")
	}

	if user.Username != "testuser" {
		t.Errorf("Expected username 'testuser', got '%s'", user.Username)
	}

	if user.Password != "" {
		t.Error("Expected password to be cleared from returned user")
	}

	if user.ID == 0 {
		t.Error("Expected user ID to be set")
	}

	savedUser, exists := userRepo.users["testuser"]
	if !exists {
		t.Error("Expected user to be saved in repository")
	}

	if savedUser.Password == "password123" {
		t.Error("Expected password to be hashed")
	}

	err = bcrypt.CompareHashAndPassword([]byte(savedUser.Password), []byte("password123"))
	if err != nil {
		t.Error("Expected password to be properly hashed")
	}
}

func TestRegister_ValidationErrors(t *testing.T) {
	userRepo := &mockUserRepository{
		users: make(map[string]*models.User),
	}
	service := NewAuthService(userRepo, "test-secret-key-that-is-long-enough")

	testCases := []struct {
		name     string
		username string
		password string
	}{
		{"Short username", "ab", "password123"},
		{"Short password", "testuser", "12345"},
		{"Empty username", "", "password123"},
		{"Empty password", "testuser", ""},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			user, err := service.Register(tc.username, tc.password)

			if err == nil {
				t.Error("Expected validation error")
			}

			if user != nil {
				t.Error("Expected no user to be returned on validation error")
			}
		})
	}
}

func TestRegister_DuplicateUsername(t *testing.T) {
	userRepo := &mockUserRepository{
		users: map[string]*models.User{
			"existing": {
				ID:       1,
				Username: "existing",
				Password: "hashedpassword",
			},
		},
	}
	service := NewAuthService(userRepo, "test-secret-key-that-is-long-enough")

	user, err := service.Register("existing", "password123")

	if err == nil {
		t.Error("Expected error for duplicate username")
	}

	if user != nil {
		t.Error("Expected no user to be returned on duplicate username")
	}

	if err.Error() != "username already exists" {
		t.Errorf("Expected 'username already exists' error, got '%s'", err.Error())
	}
}

func TestLogin_Success(t *testing.T) {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	userRepo := &mockUserRepository{
		users: map[string]*models.User{
			"testuser": {
				ID:       1,
				Username: "testuser",
				Password: string(hashedPassword),
			},
		},
	}
	service := NewAuthService(userRepo, "test-secret-key-that-is-long-enough")

	token, user, err := service.Login("testuser", "password123")

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if token == "" {
		t.Error("Expected token to be returned")
	}

	if user == nil {
		t.Error("Expected user to be returned")
	}

	if user.Username != "testuser" {
		t.Errorf("Expected username 'testuser', got '%s'", user.Username)
	}

	if user.Password != "" {
		t.Error("Expected password to be cleared from returned user")
	}

	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte("test-secret-key-that-is-long-enough"), nil
	})

	if err != nil {
		t.Errorf("Expected valid JWT token, got error: %v", err)
	}

	if !parsedToken.Valid {
		t.Error("Expected valid JWT token")
	}

	claims := parsedToken.Claims.(jwt.MapClaims)
	if claims["username"] != "testuser" {
		t.Errorf("Expected username in token claims, got %v", claims["username"])
	}

	if claims["user_id"] != float64(1) {
		t.Errorf("Expected user_id in token claims, got %v", claims["user_id"])
	}
}

func TestLogin_InvalidCredentials(t *testing.T) {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	userRepo := &mockUserRepository{
		users: map[string]*models.User{
			"testuser": {
				ID:       1,
				Username: "testuser",
				Password: string(hashedPassword),
			},
		},
	}
	service := NewAuthService(userRepo, "test-secret-key-that-is-long-enough")

	testCases := []struct {
		name     string
		username string
		password string
	}{
		{"Wrong password", "testuser", "wrongpassword"},
		{"Wrong username", "wronguser", "password123"},
		{"Both wrong", "wronguser", "wrongpassword"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			token, user, err := service.Login(tc.username, tc.password)

			if err == nil {
				t.Error("Expected error for invalid credentials")
			}

			if token != "" {
				t.Error("Expected no token on invalid credentials")
			}

			if user != nil {
				t.Error("Expected no user on invalid credentials")
			}

			if err.Error() != "invalid credentials" {
				t.Errorf("Expected 'invalid credentials' error, got '%s'", err.Error())
			}
		})
	}
}

func TestValidateToken_ValidToken(t *testing.T) {
	jwtSecret := "test-secret-key-that-is-long-enough"
	service := NewAuthService(nil, jwtSecret)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  1,
		"username": "testuser",
		"exp":      time.Now().Add(time.Hour).Unix(),
	})

	tokenString, _ := token.SignedString([]byte(jwtSecret))

	claims, err := service.ValidateToken(tokenString)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if claims == nil {
		t.Error("Expected claims to be returned")
	}

	if (*claims)["username"] != "testuser" {
		t.Errorf("Expected username in claims, got %v", (*claims)["username"])
	}

	if (*claims)["user_id"] != float64(1) {
		t.Errorf("Expected user_id in claims, got %v", (*claims)["user_id"])
	}
}

func TestValidateToken_InvalidToken(t *testing.T) {
	service := NewAuthService(nil, "test-secret-key-that-is-long-enough")

	testCases := []struct {
		name  string
		token string
	}{
		{"Empty token", ""},
		{"Invalid format", "invalid.token.format"},
		{"Wrong secret", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.wrong-signature"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			claims, err := service.ValidateToken(tc.token)

			if err == nil {
				t.Error("Expected error for invalid token")
			}

			if claims != nil {
				t.Error("Expected no claims for invalid token")
			}
		})
	}
}

func TestValidateToken_ExpiredToken(t *testing.T) {
	jwtSecret := "test-secret-key-that-is-long-enough"
	service := NewAuthService(nil, jwtSecret)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  1,
		"username": "testuser",
		"exp":      time.Now().Add(-time.Hour).Unix(),
	})

	tokenString, _ := token.SignedString([]byte(jwtSecret))

	claims, err := service.ValidateToken(tokenString)

	if err == nil {
		t.Error("Expected error for expired token")
	}

	if claims != nil {
		t.Error("Expected no claims for expired token")
	}
}