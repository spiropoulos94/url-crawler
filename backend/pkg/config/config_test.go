package config

import (
	"os"
	"testing"
)

func TestConfig_validate_Success(t *testing.T) {
	cfg := &Config{
		DatabaseURL:    "root:password@tcp(localhost:3306)/test_db",
		RedisURL:       "localhost:6379",
		JWTSecret:      "this-is-a-very-secure-jwt-secret-key-with-more-than-32-characters",
		AllowedOrigins: []string{"http://localhost:3000"},
	}

	err := cfg.validate()
	if err != nil {
		t.Errorf("Expected no validation error, got %v", err)
	}
}

func TestConfig_validate_WeakJWTSecret(t *testing.T) {
	cfg := &Config{
		DatabaseURL:    "root:password@tcp(localhost:3306)/test_db",
		RedisURL:       "localhost:6379",
		JWTSecret:      "your-secret-key-change-in-production",
		AllowedOrigins: []string{"http://localhost:3000"},
	}

	err := cfg.validate()
	if err == nil {
		t.Error("Expected validation error for weak JWT secret")
	}

	expected := "JWT_SECRET must be set to a secure value"
	if err.Error() != expected {
		t.Errorf("Expected error '%s', got '%s'", expected, err.Error())
	}
}

func TestConfig_validate_ShortJWTSecret(t *testing.T) {
	cfg := &Config{
		DatabaseURL:    "root:password@tcp(localhost:3306)/test_db",
		RedisURL:       "localhost:6379",
		JWTSecret:      "short-key",
		AllowedOrigins: []string{"http://localhost:3000"},
	}

	err := cfg.validate()
	if err == nil {
		t.Error("Expected validation error for short JWT secret")
	}

	expected := "JWT_SECRET must be at least 32 characters long"
	if err.Error() != expected {
		t.Errorf("Expected error '%s', got '%s'", expected, err.Error())
	}
}

func TestConfig_validate_EmptyDatabaseURL(t *testing.T) {
	cfg := &Config{
		DatabaseURL:    "",
		RedisURL:       "localhost:6379",
		JWTSecret:      "this-is-a-very-secure-jwt-secret-key-with-more-than-32-characters",
		AllowedOrigins: []string{"http://localhost:3000"},
	}

	err := cfg.validate()
	if err == nil {
		t.Error("Expected validation error for empty DATABASE_URL")
	}

	expected := "DATABASE_URL is required"
	if err.Error() != expected {
		t.Errorf("Expected error '%s', got '%s'", expected, err.Error())
	}
}

func TestConfig_validate_EmptyRedisURL(t *testing.T) {
	cfg := &Config{
		DatabaseURL:    "root:password@tcp(localhost:3306)/test_db",
		RedisURL:       "",
		JWTSecret:      "this-is-a-very-secure-jwt-secret-key-with-more-than-32-characters",
		AllowedOrigins: []string{"http://localhost:3000"},
	}

	err := cfg.validate()
	if err == nil {
		t.Error("Expected validation error for empty REDIS_URL")
	}

	expected := "REDIS_URL is required"
	if err.Error() != expected {
		t.Errorf("Expected error '%s', got '%s'", expected, err.Error())
	}
}

func TestGetEnv_WithValue(t *testing.T) {
	key := "TEST_ENV_VAR"
	expected := "test_value"
	
	os.Setenv(key, expected)
	defer os.Unsetenv(key)

	result := getEnv(key, "default_value")
	if result != expected {
		t.Errorf("Expected '%s', got '%s'", expected, result)
	}
}

func TestGetEnv_WithDefault(t *testing.T) {
	key := "NON_EXISTENT_ENV_VAR"
	defaultValue := "default_value"

	os.Unsetenv(key)

	result := getEnv(key, defaultValue)
	if result != defaultValue {
		t.Errorf("Expected default value '%s', got '%s'", defaultValue, result)
	}
}

func TestGetEnv_EmptyValue(t *testing.T) {
	key := "EMPTY_ENV_VAR"
	defaultValue := "default_value"
	
	os.Setenv(key, "")
	defer os.Unsetenv(key)

	result := getEnv(key, defaultValue)
	if result != defaultValue {
		t.Errorf("Expected default value '%s' for empty env var, got '%s'", defaultValue, result)
	}
}

func TestLoad_ValidEnvironment(t *testing.T) {
	// Set up valid environment variables
	os.Setenv("DATABASE_URL", "root:password@tcp(localhost:3306)/test_db")
	os.Setenv("REDIS_URL", "localhost:6379")
	os.Setenv("JWT_SECRET", "this-is-a-very-secure-jwt-secret-key-with-more-than-32-characters")
	os.Setenv("FRONTEND_URL", "http://localhost:3000")

	defer func() {
		os.Unsetenv("DATABASE_URL")
		os.Unsetenv("REDIS_URL")
		os.Unsetenv("JWT_SECRET")
		os.Unsetenv("FRONTEND_URL")
	}()

	cfg := Load()
	
	if cfg == nil {
		t.Error("Expected non-nil config")
	}

	if cfg.DatabaseURL != "root:password@tcp(localhost:3306)/test_db" {
		t.Errorf("Expected DATABASE_URL to be set correctly")
	}

	if cfg.JWTSecret != "this-is-a-very-secure-jwt-secret-key-with-more-than-32-characters" {
		t.Errorf("Expected JWT_SECRET to be set correctly")
	}

	if len(cfg.AllowedOrigins) != 1 || cfg.AllowedOrigins[0] != "http://localhost:3000" {
		t.Errorf("Expected AllowedOrigins to be set correctly")
	}
}

func TestLoad_WithDefaults(t *testing.T) {
	// Clear relevant environment variables
	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("REDIS_URL")
	os.Unsetenv("FRONTEND_URL")
	
	// Set a valid JWT secret to avoid validation failure
	os.Setenv("JWT_SECRET", "this-is-a-very-secure-jwt-secret-key-with-more-than-32-characters")
	defer os.Unsetenv("JWT_SECRET")

	cfg := Load()
	
	if cfg == nil {
		t.Error("Expected non-nil config")
	}

	expectedDB := "root:password@tcp(localhost:3306)/sykell_crawler?charset=utf8mb4&parseTime=True&loc=Local"
	if cfg.DatabaseURL != expectedDB {
		t.Errorf("Expected default DATABASE_URL, got '%s'", cfg.DatabaseURL)
	}

	if cfg.RedisURL != "localhost:6379" {
		t.Errorf("Expected default REDIS_URL, got '%s'", cfg.RedisURL)
	}

	if len(cfg.AllowedOrigins) != 1 || cfg.AllowedOrigins[0] != "http://localhost:5173" {
		t.Errorf("Expected default AllowedOrigins, got %v", cfg.AllowedOrigins)
	}
}