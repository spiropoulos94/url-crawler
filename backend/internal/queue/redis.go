package queue

import (
	"context"
	"log"

	"github.com/go-redis/redis/v8"
)

func NewRedisClient(redisURL string) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr: redisURL,
		DB:   0,
	})

	ctx := context.Background()
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("Connected to Redis successfully")
	return rdb
}