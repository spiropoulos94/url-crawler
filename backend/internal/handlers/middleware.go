package handlers

import (
	"fmt"
	"strings"
	"sykell-crawler/internal/errors"
	"sykell-crawler/internal/services"
	"sykell-crawler/pkg/config"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(authService services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Try to get token from cookie first
		token, err := c.Cookie("auth_token")
		if err != nil {
			// Fallback to Authorization header for backward compatibility
			authHeader := c.GetHeader("Authorization")
			if authHeader == "" {
				errors.RespondWithError(c, errors.UnauthorizedError("Authentication required"))
				c.Abort()
				return
			}

			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
				errors.RespondWithError(c, errors.UnauthorizedError("Invalid authorization format"))
				c.Abort()
				return
			}
			token = tokenParts[1]
		}

		claims, err := authService.ValidateToken(token)
		if err != nil {
			errors.RespondWithError(c, errors.UnauthorizedError("Invalid token"))
			c.Abort()
			return
		}

		c.Set("user_id", (*claims)["user_id"])
		c.Set("username", (*claims)["username"])
		c.Next()
	}
}

func CORSMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allowed := false
		for _, allowedOrigin := range cfg.AllowedOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}

		fmt.Println("Allowed Origins:", cfg.AllowedOrigins)

		if allowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
