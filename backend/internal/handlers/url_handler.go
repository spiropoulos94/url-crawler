package handlers

import (
	"net/http"
	"strconv"
	"sykell-crawler/internal/services"

	"github.com/gin-gonic/gin"
)

type URLHandler struct {
	urlService services.URLService
}

func NewURLHandler(urlService services.URLService) *URLHandler {
	return &URLHandler{urlService: urlService}
}

type AddURLRequest struct {
	URL string `json:"url" binding:"required"`
}

type BulkActionRequest struct {
	IDs    []uint `json:"ids" binding:"required"`
	Action string `json:"action" binding:"required,oneof=start stop delete recrawl"`
}

type URLListResponse struct {
	URLs  interface{} `json:"urls"`
	Total int64       `json:"total"`
	Page  int         `json:"page"`
	Limit int         `json:"limit"`
}

func (h *URLHandler) AddURL(c *gin.Context) {
	var req AddURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	url, err := h.urlService.AddURL(req.URL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, url)
}

func (h *URLHandler) GetURL(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}

	url, err := h.urlService.GetURL(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	c.JSON(http.StatusOK, url)
}

func (h *URLHandler) GetAllURLs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	sortBy := c.DefaultQuery("sort_by", "created_at")
	sortOrder := c.DefaultQuery("sort_order", "desc")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	urls, total, err := h.urlService.GetAllURLs(page, limit, search, sortBy, sortOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := URLListResponse{
		URLs:  urls,
		Total: total,
		Page:  page,
		Limit: limit,
	}

	c.JSON(http.StatusOK, response)
}

func (h *URLHandler) BulkAction(c *gin.Context) {
	var req BulkActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var err error
	switch req.Action {
	case "stop":
		err = h.urlService.StopCrawling(req.IDs)
	case "delete":
		err = h.urlService.DeleteURLs(req.IDs)
	case "recrawl":
		err = h.urlService.RecrawlURLs(req.IDs)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid action"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Action completed successfully"})
}