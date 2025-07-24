package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

type QueueService interface {
	EnqueueCrawlJob(urlID uint) error
	ProcessCrawlJobs(ctx context.Context, crawlerService CrawlerService) error
	CancelCrawlJob(urlID uint) error
	ClearCancellation(urlID uint) error
	IsCancelled(urlID uint) (bool, error)
}

type CrawlJob struct {
	URLID     uint      `json:"url_id"`
	CreatedAt time.Time `json:"created_at"`
}

type queueService struct {
	redis *redis.Client
}

func NewQueueService(redisClient *redis.Client) QueueService {
	return &queueService{redis: redisClient}
}

func (s *queueService) EnqueueCrawlJob(urlID uint) error {
	job := CrawlJob{
		URLID:     urlID,
		CreatedAt: time.Now(),
	}

	jobData, err := json.Marshal(job)
	if err != nil {
		return err
	}

	return s.redis.LPush(context.Background(), "crawl_queue", jobData).Err()
}

func (s *queueService) ProcessCrawlJobs(ctx context.Context, crawlerService CrawlerService) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			result, err := s.redis.BRPop(ctx, 5*time.Second, "crawl_queue").Result()
			if err != nil {
				if err == redis.Nil {
					continue
				}
				log.Printf("Error popping from queue: %v", err)
				continue
			}

			if len(result) < 2 {
				continue
			}

			var job CrawlJob
			if err := json.Unmarshal([]byte(result[1]), &job); err != nil {
				log.Printf("Error unmarshaling job: %v", err)
				continue
			}

			// Check if job was cancelled before processing
			cancelled, err := s.IsCancelled(job.URLID)
			if err != nil {
				log.Printf("Error checking cancellation for URL ID %d: %v", job.URLID, err)
				continue
			}
			if cancelled {
				log.Printf("Skipping cancelled job for URL ID: %d", job.URLID)
				continue
			}

			log.Printf("Processing crawl job for URL ID: %d", job.URLID)
			if err := crawlerService.CrawlURL(job.URLID); err != nil {
				log.Printf("Error crawling URL ID %d: %v", job.URLID, err)
			}
		}
	}
}

func (s *queueService) CancelCrawlJob(urlID uint) error {
	key := fmt.Sprintf("cancelled_job:%d", urlID)
	return s.redis.Set(context.Background(), key, "true", 30*time.Minute).Err()
}

func (s *queueService) ClearCancellation(urlID uint) error {
	key := fmt.Sprintf("cancelled_job:%d", urlID)
	return s.redis.Del(context.Background(), key).Err()
}

func (s *queueService) IsCancelled(urlID uint) (bool, error) {
	key := fmt.Sprintf("cancelled_job:%d", urlID)
	result, err := s.redis.Get(context.Background(), key).Result()
	if err != nil {
		if err == redis.Nil {
			return false, nil
		}
		return false, err
	}
	return result == "true", nil
}