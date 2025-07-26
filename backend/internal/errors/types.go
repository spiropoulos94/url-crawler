package errors

import "net/http"

// ErrorCode represents different types of API errors
type ErrorCode string

const (
	ErrValidation   ErrorCode = "VALIDATION_ERROR"
	ErrNotFound     ErrorCode = "NOT_FOUND"
	ErrUnauthorized ErrorCode = "UNAUTHORIZED"
	ErrConflict     ErrorCode = "CONFLICT"
	ErrInternal     ErrorCode = "INTERNAL_ERROR"
)

// APIError represents a structured API error response
type APIError struct {
	Code    ErrorCode `json:"code"`
	Message string    `json:"message"`
	Status  int       `json:"-"`
}

// Error implements the error interface
func (e *APIError) Error() string {
	return e.Message
}

// NewAPIError creates a new APIError with the given code, message and HTTP status
func NewAPIError(code ErrorCode, message string, status int) *APIError {
	return &APIError{
		Code:    code,
		Message: message,
		Status:  status,
	}
}

// Common error constructors
func ValidationError(message string) *APIError {
	return NewAPIError(ErrValidation, message, http.StatusBadRequest)
}

func NotFoundError(message string) *APIError {
	return NewAPIError(ErrNotFound, message, http.StatusNotFound)
}

func UnauthorizedError(message string) *APIError {
	return NewAPIError(ErrUnauthorized, message, http.StatusUnauthorized)
}

func ConflictError(message string) *APIError {
	return NewAPIError(ErrConflict, message, http.StatusConflict)
}

func InternalError(message string) *APIError {
	return NewAPIError(ErrInternal, message, http.StatusInternalServerError)
}