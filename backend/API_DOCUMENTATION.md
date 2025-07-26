# Sykell Crawler API Documentation

## Base URL
All API endpoints are prefixed with `/api/v1`

## Authentication
The API uses JWT tokens stored in HTTP-only cookies for authentication. After successful login, the token is automatically included in subsequent requests.

## Error Responses
All errors follow a consistent format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable error message"
}
```

### Error Codes
- `VALIDATION_ERROR` (400) - Request validation failed
- `UNAUTHORIZED` (401) - Authentication required or invalid
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource already exists
- `INTERNAL_ERROR` (500) - Server error

---

## Authentication Endpoints

### POST /api/v1/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string", // required, min 3 characters
  "password": "string"  // required, min 6 characters
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
- 400: Validation error (invalid username/password)
- 409: Username already exists

---

### POST /api/v1/auth/login
Authenticate user and set auth cookie.

**Request Body:**
```json
{
  "username": "string", // required
  "password": "string"  // required
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Side Effect:** Sets `auth_token` HTTP-only cookie (7 days expiry)

**Error Responses:**
- 400: Validation error
- 401: Invalid credentials

---

### POST /api/v1/auth/logout
Clear authentication cookie.

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Side Effect:** Clears `auth_token` cookie

---

## URL Management Endpoints
*All endpoints require authentication*

### POST /api/v1/urls
Add a new URL for crawling.

**Request Body:**
```json
{
  "url": "string" // required, valid URL
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "url": "https://example.com",
  "title": "",
  "status": "queued",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- 400: Invalid URL format

---

### GET /api/v1/urls
Get paginated list of URLs with optional filtering and sorting.

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page (1-100), default 10
- `search` (optional): Search term for URL filtering
- `sort_by` (optional): Sort field, default "created_at"
- `sort_order` (optional): "asc" or "desc", default "desc"

**Success Response (200):**
```json
{
  "urls": [
    {
      "id": 1,
      "url": "https://example.com",
      "title": "Example Domain",
      "status": "done",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "results": [
        {
          "id": 1,
          "url_id": 1,
          "html_version": "HTML5",
          "title": "Example Domain",
          "h1_count": 1,
          "h2_count": 2,
          "h3_count": 0,
          "h4_count": 0,
          "h5_count": 0,
          "h6_count": 0,
          "internal_links": 5,
          "external_links": 3,
          "broken_links": 0,
          "has_login_form": false,
          "created_at": "2024-01-01T00:00:00Z",
          "updated_at": "2024-01-01T00:00:00Z",
          "broken_urls": []
        }
      ]
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

### GET /api/v1/urls/:id
Get details for a specific URL.

**Path Parameters:**
- `id`: URL ID (integer)

**Success Response (200):**
```json
{
  "id": 1,
  "url": "https://example.com",
  "title": "Example Domain",
  "status": "done",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "results": [
    {
      "id": 1,
      "url_id": 1,
      "html_version": "HTML5",
      "title": "Example Domain",
      "h1_count": 1,
      "h2_count": 2,
      "h3_count": 0,
      "h4_count": 0,
      "h5_count": 0,
      "h6_count": 0,
      "internal_links": 5,
      "external_links": 3,
      "broken_links": 0,
      "has_login_form": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "broken_urls": []
    }
  ]
}
```

**Error Responses:**
- 400: Invalid URL ID
- 404: URL not found

---

### POST /api/v1/urls/bulk
Perform bulk actions on multiple URLs.

**Request Body:**
```json
{
  "ids": [1, 2, 3],           // required, array of URL IDs
  "action": "string"          // required, one of: "stop", "delete", "recrawl"
}
```

**Success Response (200):**
```json
{
  "message": "Action completed successfully"
}
```

**Available Actions:**
- `stop`: Stop crawling for the specified URLs
- `delete`: Delete the specified URLs
- `recrawl`: Re-queue the specified URLs for crawling

**Error Responses:**
- 400: Invalid action or missing IDs

---

## Health Check Endpoint

### GET /health
Check API and service health status.

**Success Response (200):**
```json
{
  "status": "ok",
  "timestamp": 1640995200,
  "checks": {
    "database": {
      "status": "ok"
    },
    "redis": {
      "status": "ok"
    }
  }
}
```

**Degraded Response (503):**
```json
{
  "status": "degraded",
  "timestamp": 1640995200,
  "checks": {
    "database": {
      "status": "error",
      "message": "database ping failed"
    },
    "redis": {
      "status": "ok"
    }
  }
}
```

---

## Data Models

### URL Status Values
- `queued`: URL is waiting to be crawled
- `running`: URL is currently being crawled
- `done`: Crawling completed successfully
- `error`: Crawling failed
- `stopped`: Crawling was manually stopped

### User Model
```json
{
  "id": 1,
  "username": "string",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### URL Model
```json
{
  "id": 1,
  "url": "https://example.com",
  "title": "Page Title",
  "status": "done",
  "error_message": "Error details if status is error",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "results": []
}
```

### CrawlResult Model
```json
{
  "id": 1,
  "url_id": 1,
  "html_version": "HTML5",
  "title": "Page Title",
  "h1_count": 1,
  "h2_count": 2,
  "h3_count": 0,
  "h4_count": 0,
  "h5_count": 0,
  "h6_count": 0,
  "internal_links": 5,
  "external_links": 3,
  "broken_links": 1,
  "has_login_form": false,
  "error_message": "Error details if crawling failed",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "broken_urls": []
}
```

### BrokenURL Model
```json
{
  "id": 1,
  "crawl_result_id": 1,
  "url": "https://example.com/broken-link",
  "status_code": 404,
  "error_message": "Not Found",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## Frontend Integration Notes

### Authentication Flow
1. User registers/logs in → Server sets HTTP-only cookie
2. Frontend makes requests → Browser automatically includes cookie
3. Server validates cookie → Returns user data or 401

### Error Handling
All API responses follow consistent error format. Frontend should check for error structure and display appropriate messages.

### Pagination
Use `page` and `limit` query parameters. Server returns total count for implementing pagination UI.

### Real-time Updates
URLs are processed asynchronously. Frontend should poll the GET endpoints or implement WebSocket connections for real-time status updates.