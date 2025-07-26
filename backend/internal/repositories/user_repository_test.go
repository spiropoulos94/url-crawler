package repositories

import (
	"sykell-crawler/internal/models"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestUserDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to create in-memory database: %v", err)
	}

	err = db.AutoMigrate(&models.User{})
	if err != nil {
		t.Fatalf("Failed to migrate tables: %v", err)
	}

	return db
}

func TestNewUserRepository(t *testing.T) {
	repo := NewUserRepository(nil)
	if repo == nil {
		t.Error("Expected non-nil repo")
	}
}

func TestUserRepository_Create(t *testing.T) {
	db := setupTestUserDB(t)
	repo := NewUserRepository(db)

	user := &models.User{
		Username: "testuser",
		Password: "hashedpassword",
	}

	err := repo.Create(user)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if user.ID == 0 {
		t.Error("Expected user ID to be set after creation")
	}
}

func TestUserRepository_GetByID(t *testing.T) {
	db := setupTestUserDB(t)
	repo := NewUserRepository(db)

	user := &models.User{
		Username: "testuser",
		Password: "hashedpassword",
	}
	repo.Create(user)

	retrieved, err := repo.GetByID(user.ID)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if retrieved.Username != user.Username {
		t.Errorf("Expected username '%s', got '%s'", user.Username, retrieved.Username)
	}

	if retrieved.Password != user.Password {
		t.Errorf("Expected password '%s', got '%s'", user.Password, retrieved.Password)
	}
}

func TestUserRepository_GetByID_NotFound(t *testing.T) {
	db := setupTestUserDB(t)
	repo := NewUserRepository(db)

	_, err := repo.GetByID(999)
	if err == nil {
		t.Error("Expected error for non-existent user")
	}
}

func TestUserRepository_GetByUsername(t *testing.T) {
	db := setupTestUserDB(t)
	repo := NewUserRepository(db)

	user := &models.User{
		Username: "testuser",
		Password: "hashedpassword",
	}
	repo.Create(user)

	retrieved, err := repo.GetByUsername("testuser")
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if retrieved.Username != user.Username {
		t.Errorf("Expected username '%s', got '%s'", user.Username, retrieved.Username)
	}

	if retrieved.ID != user.ID {
		t.Errorf("Expected ID %d, got %d", user.ID, retrieved.ID)
	}
}

func TestUserRepository_GetByUsername_NotFound(t *testing.T) {
	db := setupTestUserDB(t)
	repo := NewUserRepository(db)

	_, err := repo.GetByUsername("nonexistent")
	if err == nil {
		t.Error("Expected error for non-existent username")
	}
}

func TestUserRepository_Update(t *testing.T) {
	db := setupTestUserDB(t)
	repo := NewUserRepository(db)

	user := &models.User{
		Username: "testuser",
		Password: "originalpassword",
	}
	repo.Create(user)

	user.Password = "newpassword"
	err := repo.Update(user)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	retrieved, _ := repo.GetByID(user.ID)
	if retrieved.Password != "newpassword" {
		t.Errorf("Expected password to be updated to 'newpassword', got '%s'", retrieved.Password)
	}
}

func TestUserRepository_Delete(t *testing.T) {
	db := setupTestUserDB(t)
	repo := NewUserRepository(db)

	user := &models.User{
		Username: "testuser",
		Password: "hashedpassword",
	}
	repo.Create(user)

	err := repo.Delete(user.ID)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	_, err = repo.GetByID(user.ID)
	if err == nil {
		t.Error("Expected error when retrieving deleted user")
	}
}

func TestUserRepository_UniqueUsername(t *testing.T) {
	db := setupTestUserDB(t)
	repo := NewUserRepository(db)

	user1 := &models.User{
		Username: "testuser",
		Password: "password1",
	}
	repo.Create(user1)

	user2 := &models.User{
		Username: "testuser", 
		Password: "password2",
	}
	err := repo.Create(user2)
	if err == nil {
		t.Error("Expected error when creating user with duplicate username")
	}
}