# ⏺ Backend Architecture Overview

This backend is a Go-based web crawler service with a clean architecture following domain-driven design principles. Here's how it's structured:

---

## 1. Application Entry Point

**`cmd/main.go:15-46`**

- Bootstraps the application by:
  - Loading environment variables
  - Connecting to MySQL database
  - Running migrations
  - Setting up Redis
  - Starting the HTTP server on port 8080

---

## 2. Core Architecture Layers

### Configuration Layer

**`pkg/config/config.go:14-21`**

- Manages environment variables for:
  - Database URL
  - Redis URL
  - JWT secret
  - Allowed origins
- Provides sensible defaults

### Database Layer

**`internal/database/database.go:13-49`**

- Handles MySQL connection with retry logic
- Auto-migration of 4 core models:
  - `User`
  - `URL`
  - `CrawlResult`
  - `BrokenURL`
- Uses GORM as the ORM
- Includes connection pooling and retry mechanisms

### Models Layer

**`internal/models/models.go:19-71`**  
Defines 4 main entities:

- **URL**: Stores crawled URLs with status tracking (queued/running/done/error/stopped)
- **CrawlResult**: Contains detailed crawl analysis (HTML version, heading counts, link metrics)
- **BrokenURL**: Tracks broken links found during crawling
- **User**: Basic authentication model

---

## 3. Business Logic Layers

### Repository Layer

**`internal/repositories/url_repository.go:10-136`**

- Data access for URLs
- Supports:
  - Complex queries
  - Soft-delete
  - Search
  - Sorting
  - Pagination
- Follows clean repository pattern using interfaces

### Service Layer

- **`internal/services/url_service.go:19-199`**

  - Core business logic for URL management
  - Includes validation, normalization, and queue integration

- **`internal/services/crawler_service.go:15-239`**
  - Web crawling engine using `goquery` for HTML parsing
  - Analyzes:
    - Headings
    - Links
    - Forms
    - Broken URLs
  - Implements:
    - Cancellation support
    - Comprehensive link analysis

- **`internal/services/auth_service.go:14-104`**
  - JWT token management with HMAC-SHA256 signing
  - bcrypt password hashing with default cost
  - User registration and authentication
  - 7-day token expiration
  - Token validation and claims extraction

### Queue Layer

**`internal/queue/redis.go:10-24`**

- Redis client setup for job queuing system
- Supports:
  - Background processing
  - Job cancellation

---

## 4. API Layer

### HTTP Server

**`internal/api/server.go:16-97`**

- Gin-based REST API server with middleware:
  - CORS
  - Auth
  - Logging
- Routes:
  - `/api/v1/auth/*`
  - `/api/v1/urls/*`
- Starts background crawler workers for asynchronous URL processing

### Handlers

**`internal/handlers/url_handler.go:11-124`**

- REST endpoints for URL CRUD operations
- Features:
  - Pagination
  - Search
  - Sorting
  - Bulk actions (start/stop/delete/recrawl)

**`internal/handlers/auth_handler.go:10-92`**

- Authentication endpoints:
  - `POST /auth/register` - User registration
  - `POST /auth/login` - Login with httpOnly cookie setting
  - `POST /auth/logout` - Logout with cookie clearing
- Secure cookie configuration:
  - HttpOnly flag (JavaScript inaccessible)
  - SameSite=Strict (CSRF protection)
  - 7-day expiration
  - Path="/" (domain-wide)

**`internal/handlers/middleware.go:13-70`**

- **AuthMiddleware**: JWT token validation
  - Primary: Reads token from httpOnly cookie
  - Fallback: Authorization header for backward compatibility
  - Sets user context for protected routes
- **CORSMiddleware**: Cross-origin request handling
  - Configurable allowed origins
  - Credentials support enabled
  - Preflight request handling

---

## 5. Authentication Architecture

### Security Model

The application implements a **secure, httpOnly cookie-based JWT authentication system** with the following security features:

#### JWT Token Flow

1. **Login Process**:
   ```go
   // User submits credentials
   POST /api/v1/auth/login
   {
     "username": "john",
     "password": "secret123"
   }

   // Backend validates and creates token
   token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
     "user_id":  user.ID,
     "username": user.Username,
     "exp":      time.Now().Add(time.Hour * 24 * 7).Unix(),
   })

   // Sets httpOnly cookie
   c.SetCookie("auth_token", token, 604800, "/", "", false, true)
   ```

2. **Request Authentication**:
   ```go
   // AuthMiddleware extracts token from cookie
   token, err := c.Cookie("auth_token")
   
   // Validates JWT signature and expiration
   claims, err := authService.ValidateToken(token)
   
   // Sets user context for handlers
   c.Set("user_id", claims["user_id"])
   ```

3. **Logout Process**:
   ```go
   // Clears cookie by setting negative Max-Age
   c.SetCookie("auth_token", "", -1, "/", "", false, true)
   ```

#### Security Features

- **XSS Protection**: HttpOnly cookies prevent JavaScript access
- **CSRF Protection**: SameSite=Strict prevents cross-site requests
- **Token Integrity**: HMAC-SHA256 signature validation
- **Password Security**: bcrypt hashing with default cost
- **Automatic Expiration**: 7-day token lifetime
- **Secure Headers**: Proper CORS configuration

#### Database Security

- **Password Storage**: Never stored in plain text, always bcrypt hashed
- **User Model**: Soft deletes with GORM timestamps
- **Unique Constraints**: Username uniqueness enforced at DB level

---

## 6. Key Features

- **Asynchronous Processing**: URLs are queued in Redis and processed by background workers
- **Comprehensive Analysis**:
  - Extracts HTML version
  - Title
  - Heading counts
  - Internal/external links
  - Broken links
  - Login form detection
- **Job Control**: Start, stop, and recrawl URLs with real-time status updates
- **Soft Deletes**: Supports restoration of soft-deleted URLs
- **Authentication**: Secure httpOnly cookie-based JWT authentication
- **Scalable Design**:
  - Clean separation of concerns
  - Dependency injection

---

## 7. System Architecture Summary

The system follows a **producer-consumer pattern**:

- The **API** accepts URLs and queues them in **Redis**
- **Background workers** consume jobs from the queue
- Crawlers process URLs asynchronously
- Status is updated in the **database**
