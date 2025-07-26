package handlers

import (
	"net/http"
	"sykell-crawler/internal/errors"
	"sykell-crawler/internal/services"
	"time"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService services.AuthService
}

func NewAuthHandler(authService services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	User interface{} `json:"user"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errors.RespondWithError(c, errors.ValidationError(err.Error()))
		return
	}

	user, err := h.authService.Register(req.Username, req.Password)
	if err != nil {
		errors.RespondWithError(c, errors.ConflictError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, gin.H{"user": user})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errors.RespondWithError(c, errors.ValidationError(err.Error()))
		return
	}

	token, user, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		errors.RespondWithError(c, errors.UnauthorizedError(err.Error()))
		return
	}

	// Set httpOnly cookie with secure flags
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		"auth_token",           // name
		token,                  // value
		int(time.Hour*24*7/time.Second), // maxAge (7 days in seconds)
		"/",                    // path
		"",                     // domain (empty = current domain)
		false,                  // secure (set to true in production with HTTPS)
		true,                   // httpOnly
	)

	c.JSON(http.StatusOK, AuthResponse{
		User: user,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	// Clear the auth cookie
	c.SetCookie(
		"auth_token",
		"",
		-1,    // maxAge: -1 deletes the cookie
		"/",
		"",
		false, // secure (set to true in production with HTTPS)
		true,  // httpOnly
	)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}