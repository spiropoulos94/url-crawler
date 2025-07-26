package errors

import "github.com/gin-gonic/gin"

// RespondWithError sends a structured error response
func RespondWithError(c *gin.Context, err *APIError) {
	c.JSON(err.Status, gin.H{
		"error": err.Message,
		"code":  err.Code,
	})
}

// RespondWithStandardError converts a standard error to an internal server error
func RespondWithStandardError(c *gin.Context, err error) {
	apiErr := InternalError(err.Error())
	RespondWithError(c, apiErr)
}