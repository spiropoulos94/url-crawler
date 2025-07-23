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
}

func NewCrawlerService(urlRepo repositories.URLRepository, resultRepo repositories.CrawlResultRepository) CrawlerService {
	return &crawlerService{
		urlRepo:    urlRepo,
		resultRepo: resultRepo,
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

	if err := s.urlRepo.UpdateStatus(urlID, models.StatusRunning); err != nil {
		return err
	}

	result, err := s.performCrawl(urlModel.URL)
	if err != nil {
		s.urlRepo.UpdateStatus(urlID, models.StatusError)
		result = &models.CrawlResult{
			URLID:        urlID,
			ErrorMessage: err.Error(),
		}
	} else {
		s.urlRepo.UpdateStatus(urlID, models.StatusDone)
		urlModel.Title = result.Title
		s.urlRepo.Update(urlModel)
	}

	result.URLID = urlID
	return s.resultRepo.Create(result)
}

func (s *crawlerService) performCrawl(targetURL string) (*models.CrawlResult, error) {
	resp, err := s.client.Get(targetURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

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