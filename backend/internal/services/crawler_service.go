package services

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sykell-crawler/internal/models"
	"sykell-crawler/internal/repositories"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type CrawlerService interface {
	CrawlURL(urlID uint) error
}

type crawlerService struct {
	urlRepo    repositories.URLRepository
	resultRepo repositories.CrawlResultRepository
	client     *http.Client
	queue      QueueService
}

func NewCrawlerService(urlRepo repositories.URLRepository, resultRepo repositories.CrawlResultRepository, queue QueueService) CrawlerService {
	return &crawlerService{
		urlRepo:    urlRepo,
		resultRepo: resultRepo,
		queue:      queue,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *crawlerService) CrawlURL(urlID uint) error {
	urlModel, err := s.urlRepo.GetByID(urlID)
	if err != nil {
		return err
	}

	// Check if job was stopped
	cancelled, err := s.queue.IsCancelled(urlID)
	if err != nil {
		return err
	}
	if cancelled {
		s.urlRepo.UpdateStatus(urlID, models.StatusStopped)
		return nil
	}

	if err := s.urlRepo.UpdateStatus(urlID, models.StatusRunning); err != nil {
		return err
	}

	result, err := s.performCrawl(urlModel.URL, urlID)
	if err != nil {
		// Check if error was due to job being stopped
		if cancelled, checkErr := s.queue.IsCancelled(urlID); checkErr == nil && cancelled {
			urlModel.Status = models.StatusStopped
			urlModel.ErrorMessage = ""
		} else {
			urlModel.Status = models.StatusError
			urlModel.ErrorMessage = err.Error()
		}
		s.urlRepo.Update(urlModel)
		result = &models.CrawlResult{
			URLID:        urlID,
			ErrorMessage: err.Error(),
		}
	} else {
		urlModel.Status = models.StatusDone
		urlModel.Title = result.Title
		urlModel.ErrorMessage = "" // Clear any previous error
		s.urlRepo.Update(urlModel)
	}

	result.URLID = urlID
	return s.resultRepo.Upsert(result)
}

func (s *crawlerService) performCrawl(targetURL string, urlID uint) (*models.CrawlResult, error) {
	// Check if job was stopped before starting HTTP request
	if cancelled, err := s.queue.IsCancelled(urlID); err == nil && cancelled {
		return nil, fmt.Errorf("crawl stopped")
	}

	resp, err := s.client.Get(targetURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	// Check if job was stopped after HTTP request
	if cancelled, err := s.queue.IsCancelled(urlID); err == nil && cancelled {
		return nil, fmt.Errorf("crawl stopped")
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %w", err)
	}

	result := &models.CrawlResult{
		HTMLVersion:   s.extractHTMLVersion(doc),
		Title:         s.extractTitle(doc),
		H1Count:       s.countHeadings(doc, "h1"),
		H2Count:       s.countHeadings(doc, "h2"),
		H3Count:       s.countHeadings(doc, "h3"),
		H4Count:       s.countHeadings(doc, "h4"),
		H5Count:       s.countHeadings(doc, "h5"),
		H6Count:       s.countHeadings(doc, "h6"),
		HasLoginForm:  s.detectLoginForm(doc),
	}

	internalLinks, externalLinks, brokenURLs := s.analyzeLinks(doc, targetURL)
	result.InternalLinks = internalLinks
	result.ExternalLinks = externalLinks
	result.BrokenLinks = len(brokenURLs)
	result.BrokenURLs = brokenURLs

	return result, nil
}

func (s *crawlerService) extractHTMLVersion(doc *goquery.Document) string {
	doctype := doc.Find("html").AttrOr("", "")
	if doctype == "" {
		return "HTML5"
	}
	
	html := doc.Find("html").First()
	if html.Length() == 0 {
		return "Unknown"
	}
	
	return "HTML5"
}

func (s *crawlerService) extractTitle(doc *goquery.Document) string {
	return strings.TrimSpace(doc.Find("title").Text())
}

func (s *crawlerService) countHeadings(doc *goquery.Document, tag string) int {
	return doc.Find(tag).Length()
}

func (s *crawlerService) detectLoginForm(doc *goquery.Document) bool {
	hasPasswordField := doc.Find("input[type='password']").Length() > 0
	hasLoginKeywords := false
	
	doc.Find("form").Each(func(_ int, form *goquery.Selection) {
		formHTML := form.Text()
		lowerHTML := strings.ToLower(formHTML)
		if strings.Contains(lowerHTML, "login") || 
		   strings.Contains(lowerHTML, "sign in") || 
		   strings.Contains(lowerHTML, "log in") {
			hasLoginKeywords = true
		}
	})
	
	return hasPasswordField && hasLoginKeywords
}

func (s *crawlerService) analyzeLinks(doc *goquery.Document, baseURL string) (int, int, []models.BrokenURL) {
	parsedBase, err := url.Parse(baseURL)
	if err != nil {
		return 0, 0, nil
	}

	var internalCount, externalCount int
	var brokenURLs []models.BrokenURL
	checkedURLs := make(map[string]bool)

	doc.Find("a[href]").Each(func(_ int, link *goquery.Selection) {
		href, exists := link.Attr("href")
		if !exists || href == "" {
			return
		}

		parsedHref, err := url.Parse(href)
		if err != nil {
			return
		}

		absoluteURL := parsedBase.ResolveReference(parsedHref).String()
		
		if checkedURLs[absoluteURL] {
			return
		}
		checkedURLs[absoluteURL] = true

		if parsedHref.Host == "" || parsedHref.Host == parsedBase.Host {
			internalCount++
		} else {
			externalCount++
		}

		if statusCode, err := s.checkURL(absoluteURL); err != nil || statusCode >= 400 {
			brokenURL := models.BrokenURL{
				URL:        absoluteURL,
				StatusCode: statusCode,
			}
			if err != nil {
				brokenURL.ErrorMessage = err.Error()
			}
			brokenURLs = append(brokenURLs, brokenURL)
		}
	})

	return internalCount, externalCount, brokenURLs
}

func (s *crawlerService) checkURL(targetURL string) (int, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 5 {
				return http.ErrUseLastResponse
			}
			return nil
		},
	}

	resp, err := client.Head(targetURL)
	if err != nil {
		resp, err = client.Get(targetURL)
		if err != nil {
			return 0, err
		}
	}
	defer resp.Body.Close()

	return resp.StatusCode, nil
}