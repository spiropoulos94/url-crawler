# Sykell Web Crawler - Project Architecture Documentation

## 🏗️ Overall Architecture

**Sykell** is a full-stack web crawler application that analyzes websites and provides detailed insights. It follows a **microservices-inspired monolithic architecture** with clear separation between:

- **Backend**: Go/Gin REST API with MySQL + Redis
- **Frontend**: React/TypeScript SPA with modern tooling
- **Infrastructure**: Docker containerization

---

## 🔧 Backend Deep Dive (Go/Gin)

### **Technology Stack**
- **Go 1.21** with Gin web framework
- **GORM** for database operations
- **MySQL 8.0** for data persistence
- **Redis 7** for job queues
- **JWT** for authentication

### **Architecture Pattern: Clean Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Handlers     │───▶│    Services     │───▶│  Repositories   │
│  (HTTP Layer)   │    │ (Business Logic)│    │  (Data Layer)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Routes    │    │   Core Logic    │    │     MySQL       │
│   Middleware    │    │   Validation    │    │     GORM        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Directory Structure**
```
backend/
├── cmd/main.go                 # Application entry point
├── internal/
│   ├── api/server.go          # HTTP server setup and routing
│   ├── handlers/              # HTTP request handlers
│   │   ├── auth_handler.go    # Authentication endpoints
│   │   ├── url_handler.go     # URL management endpoints
│   │   └── middleware.go      # JWT middleware
│   ├── services/              # Business logic layer
│   │   ├── auth_service.go    # User authentication logic
│   │   ├── url_service.go     # URL management logic
│   │   ├── crawler_service.go # Web crawling logic
│   │   └── queue_service.go   # Redis queue management
│   ├── repositories/          # Data access layer
│   │   ├── user_repository.go
│   │   ├── url_repository.go
│   │   └── crawl_result_repository.go
│   ├── models/                # Database models
│   │   └── models.go          # GORM models and relationships
│   ├── database/              # Database connection and migration
│   │   └── database.go
│   └── queue/                 # Redis client setup
│       └── redis.go
└── pkg/config/                # Configuration management
    └── config.go
```

### **Key Backend Components:**

**1. Entry Point (`cmd/main.go`)**
```go
// Initializes the entire application
// Sets up database connections
// Starts HTTP server and background workers
```

**2. API Server (`internal/api/server.go`)**
- Sets up Gin router with middleware (CORS, logging, authentication)
- Defines route groups (public vs protected)
- Implements dependency injection pattern

**3. Models (`internal/models/models.go`)**
```go
type URL struct {
    ID        uint           `json:"id" gorm:"primaryKey"`
    URL       string         `json:"url" gorm:"unique;not null;index"`
    Status    CrawlStatus    `json:"status" gorm:"default:queued"`
    Results   []CrawlResult  `json:"results" gorm:"foreignKey:URLID"`
    DeletedAt gorm.DeletedAt `json:"-" gorm:"index"` // Soft delete support
}

type CrawlResult struct {
    ID             uint           `json:"id" gorm:"primaryKey"`
    URLID          uint           `json:"url_id" gorm:"not null;index"`
    HTMLVersion    string         `json:"html_version"`
    Title          string         `json:"title"`
    H1Count        int            `json:"h1_count"`
    H2Count        int            `json:"h2_count"`
    H3Count        int            `json:"h3_count"`
    H4Count        int            `json:"h4_count"`
    H5Count        int            `json:"h5_count"`
    H6Count        int            `json:"h6_count"`
    InternalLinks  int            `json:"internal_links"`
    ExternalLinks  int            `json:"external_links"`
    BrokenLinks    int            `json:"broken_links"`
    HasLoginForm   bool           `json:"has_login_form"`
    BrokenURLs     []BrokenURL    `json:"broken_urls,omitempty"`
}
```

**4. Service Layer** - Business Logic Hub:
- **AuthService**: JWT token management, bcrypt password hashing
- **URLService**: URL validation, normalization, crawl orchestration
- **CrawlerService**: Core web scraping with GoQuery
- **QueueService**: Redis-based async job processing

**5. Repository Layer** - Data Access:
- Clean interface abstraction over GORM
- Supports pagination, filtering, soft deletes
- Handles complex queries with preloading

---

## 🎨 Frontend Deep Dive (React/TypeScript)

### **Technology Stack**
- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development
- **TailwindCSS** for utility-first styling
- **React Query (@tanstack/react-query)** for server state management
- **React Router** for navigation
- **Axios** for HTTP requests
- **Lucide React** for icons

### **Architecture Pattern: Modern React with Hooks**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │───▶│  Custom Hooks   │───▶│   API Services  │
│    (UI Layer)   │    │  (State Logic)  │    │ (HTTP Requests) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Router   │    │  React Query    │    │   Backend API   │
│   TailwindCSS   │    │    Context      │    │      Axios      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Directory Structure**
```
frontend/src/
├── components/                # React components
│   ├── providers/            # Context providers
│   │   └── AuthProvider.tsx  # Authentication context
│   ├── AddURL.tsx           # URL submission form
│   ├── Dashboard.tsx        # Main dashboard with stats
│   ├── URLTable.tsx         # Data table with sorting/pagination
│   ├── URLDetails.tsx       # Detailed analysis view
│   ├── Login.tsx            # Authentication form
│   ├── Layout.tsx           # App layout wrapper
│   ├── EmptyState.tsx       # Reusable empty state component
│   ├── LoadingSpinner.tsx   # Loading state components
│   └── ErrorBoundary.tsx    # Error boundary wrapper
├── hooks/                   # Custom React hooks
│   ├── useURLs.ts          # URL data fetching hooks
│   ├── useForm.ts          # Form state management
│   └── usePagination.ts    # Pagination logic
├── services/
│   └── api.ts              # API communication layer
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Main application setup
└── main.tsx               # React DOM rendering
```

### **Key Frontend Features:**

**1. Smart Components with Custom Hooks**
```typescript
// useURLs hook with React Query
export const useURLs = (params: PaginationParams) => {
  return useQuery({
    queryKey: ["urls", params.page, params.limit, params.search, params.sort_by, params.sort_order],
    queryFn: () => urlAPI.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

// Custom form hook with validation
export const useForm = <T extends Record<string, unknown>>(
  initialData: T,
  validationRules: ValidationRules<T>
) => {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form validation and state management logic
};
```

**2. Responsive Design System**
- Mobile-first approach with Tailwind breakpoints
- Desktop table view + Mobile card view
- Consistent gradient themes and color palette
- Dark mode support preparation

**3. Real-time Updates**
```typescript
// Auto-refresh for active crawls every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (data?.data?.urls?.some(url => ["queued", "running"].includes(url.status))) {
      refetch();
    }
  }, 5000);
  return () => clearInterval(interval);
}, [data?.data?.urls, refetch]);
```

**4. Advanced Data Table Features**
- Sortable columns with visual indicators
- Search functionality with debouncing
- Bulk actions (start, stop, delete, recrawl)
- Pagination with page size controls
- Empty states for different scenarios

---

## 🗄️ Database Schema & Relationships

### **Entity Relationship Diagram**
```
User (1) ──── (*) URL (1) ──── (*) CrawlResult (1) ──── (*) BrokenURL
```

### **Detailed Schema:**

**Users Table** - Authentication:
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- bcrypt hashed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

**URLs Table** - Core entity:
```sql
CREATE TABLE urls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    url VARCHAR(2048) UNIQUE NOT NULL,
    title VARCHAR(500),
    status ENUM('queued','running','done','error') DEFAULT 'queued',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,  -- Soft delete support
    INDEX idx_url (url),
    INDEX idx_status (status),
    INDEX idx_deleted_at (deleted_at)
);
```

**CrawlResults Table** - Analysis data:
```sql
CREATE TABLE crawl_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    url_id INT NOT NULL,
    html_version VARCHAR(10),
    title VARCHAR(500),
    h1_count INT DEFAULT 0,
    h2_count INT DEFAULT 0,
    h3_count INT DEFAULT 0,
    h4_count INT DEFAULT 0,
    h5_count INT DEFAULT 0,
    h6_count INT DEFAULT 0,
    internal_links INT DEFAULT 0,
    external_links INT DEFAULT 0,
    broken_links INT DEFAULT 0,
    has_login_form BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE,
    INDEX idx_url_id (url_id),
    INDEX idx_created_at (created_at)
);
```

**BrokenURLs Table** - Broken link details:
```sql
CREATE TABLE broken_urls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crawl_result_id INT NOT NULL,
    url VARCHAR(2048) NOT NULL,
    status_code INT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (crawl_result_id) REFERENCES crawl_results(id) ON DELETE CASCADE,
    INDEX idx_crawl_result_id (crawl_result_id)
);
```

---

## 🔄 Complete Data Flow

### **1. URL Submission Flow**
```
User Input → Frontend Form → API Validation → Database → Redis Queue → Background Worker
```

**Frontend Process:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!form.validateForm()) return;
  
  form.setIsSubmitting(true);
  
  try {
    await addUrlMutation.mutateAsync({
      url: form.data.url.trim(),
    });
    
    form.reset(); // Clear form on success
    // React Query automatically invalidates and refetches URL list
  } catch (error) {
    // Handle duplicate URL errors and other API errors
    const axiosError = error as AxiosError<{ error: string }>;
    if (axiosError.response?.data?.error?.includes("Duplicate entry")) {
      form.setErrors({
        url: "This URL already exists. If recently deleted, try again shortly."
      });
    }
  } finally {
    form.setIsSubmitting(false);
  }
};
```

**Backend Process:**
```go
func (s *urlService) AddURL(urlStr string) (*models.URL, error) {
    // 1. Validate URL format
    if !s.isValidURL(urlStr) {
        return nil, errors.New("invalid URL format")
    }
    
    // 2. Normalize URL (add https://, remove trailing slash)
    urlStr = s.normalizeURL(urlStr)
    
    // 3. Check for existing active URLs
    if existing, err := s.urlRepo.GetByURL(urlStr); err == nil {
        return existing, nil
    }
    
    // 4. Check for soft-deleted URLs and restore them
    if existingDeleted, err := s.urlRepo.GetDeletedByURL(urlStr); err == nil {
        s.urlRepo.RestoreURL(existingDeleted.ID)
        s.urlRepo.UpdateStatus(existingDeleted.ID, models.StatusQueued)
        s.queue.EnqueueCrawlJob(existingDeleted.ID)
        return s.urlRepo.GetByID(existingDeleted.ID)
    }
    
    // 5. Create new URL record
    newURL := &models.URL{
        URL:    urlStr,
        Status: models.StatusQueued,
    }
    
    // 6. Save to database
    if err := s.urlRepo.Create(newURL); err != nil {
        return nil, err
    }
    
    // 7. Enqueue crawl job in Redis
    if err := s.queue.EnqueueCrawlJob(newURL.ID); err != nil {
        s.urlRepo.UpdateStatus(newURL.ID, models.StatusError)
        return nil, err
    }
    
    return newURL, nil
}
```

### **2. Crawling Process Flow**
```
Redis Queue → Worker Pulls Job → HTTP Request → HTML Parsing → Analysis → Database Storage
```

**Crawler Analysis Process:**
```go
func (s *crawlerService) CrawlURL(urlID uint) error {
    // 1. Update status to "running"
    s.urlRepo.UpdateStatus(urlID, models.StatusRunning)
    
    // 2. Fetch URL with timeout and user agent
    resp, err := s.httpClient.Get(url.URL)
    if err != nil {
        return s.handleCrawlError(urlID, err)
    }
    defer resp.Body.Close()
    
    // 3. Parse HTML with GoQuery
    doc, err := goquery.NewDocumentFromReader(resp.Body)
    if err != nil {
        return s.handleCrawlError(urlID, err)
    }
    
    // 4. Extract comprehensive data
    result := &models.CrawlResult{
        URLID:         urlID,
        HTMLVersion:   s.extractHTMLVersion(doc),
        Title:         doc.Find("title").First().Text(),
        H1Count:       doc.Find("h1").Length(),
        H2Count:       doc.Find("h2").Length(),
        H3Count:       doc.Find("h3").Length(),
        H4Count:       doc.Find("h4").Length(),
        H5Count:       doc.Find("h5").Length(),
        H6Count:       doc.Find("h6").Length(),
        HasLoginForm:  s.detectLoginForm(doc),
    }
    
    // 5. Analyze links (internal vs external, check for broken links)
    s.analyzeLinks(doc, result, url.URL)
    
    // 6. Save results to database
    s.crawlResultRepo.Create(result)
    
    // 7. Update URL status to "done"
    s.urlRepo.UpdateStatus(urlID, models.StatusDone)
    
    return nil
}
```

**Link Analysis Features:**
- **HTML Version Detection**: Parses DOCTYPE declaration
- **Title Extraction**: Gets `<title>` tag content with fallback to H1
- **Heading Analysis**: Counts H1-H6 elements for SEO analysis
- **Link Categorization**: Separates internal vs external links
- **Broken Link Detection**: Tests HTTP status codes for all links
- **Login Form Detection**: Searches for authentication-related keywords and input types

### **3. Real-time UI Updates**
```
Database Changes → API Polling → React Query Cache → Component Re-render
```

**Frontend Polling Strategy:**
```typescript
// Smart polling - only when there are active crawls
useEffect(() => {
  const interval = setInterval(() => {
    if (data?.data?.urls?.some((url) => ["queued", "running"].includes(url.status))) {
      refetch(); // React Query refetch
    }
  }, 5000); // Poll every 5 seconds
  
  return () => clearInterval(interval);
}, [data?.data?.urls, refetch]);
```

---

## 🐳 Docker & Infrastructure

### **Docker Compose Architecture**
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: sykell_mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: sykell_crawler
      MYSQL_USER: sykell
      MYSQL_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: sykell_redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: sykell_backend
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      DATABASE_URL: sykell:password@tcp(mysql:3306)/sykell_crawler?charset=utf8mb4&parseTime=True&loc=Local
      REDIS_URL: redis:6379
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      FRONTEND_URL: http://localhost:3000
      PORT: 8080
    ports:
      - "8080:8080"
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
```

### **Database Initialization Script**
```sql
-- scripts/init.sql
CREATE DATABASE IF NOT EXISTS sykell_crawler;

CREATE USER IF NOT EXISTS 'sykell'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON sykell_crawler.* TO 'sykell'@'%';

-- Additional indexes for performance
USE sykell_crawler;

-- Composite indexes for common queries
CREATE INDEX idx_urls_status_created ON urls(status, created_at);
CREATE INDEX idx_crawl_results_url_created ON crawl_results(url_id, created_at);

FLUSH PRIVILEGES;
```

### **Backend Dockerfile**
```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8080
CMD ["./main"]
```

---

## 🔐 Security & Configuration

### **Authentication Flow**
```
1. User Registration/Login → bcrypt password hashing
2. JWT Token Generation → 7-day expiration with secure secret
3. Token Storage → Frontend localStorage with automatic cleanup
4. Protected Routes → Middleware validates JWT on each request
5. Auto-logout → Invalid tokens redirect to login page
```

**JWT Implementation:**
```go
// Generate JWT token
func (s *authService) GenerateToken(userID uint) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(7 * 24 * time.Hour).Unix(), // 7 days
        "iat":     time.Now().Unix(),
    })
    
    return token.SignedString([]byte(s.jwtSecret))
}

// Middleware for protected routes
func (h *AuthHandler) JWTMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenString := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
        
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return []byte(h.jwtSecret), nil
        })
        
        if err != nil || !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }
        
        claims := token.Claims.(jwt.MapClaims)
        c.Set("user_id", uint(claims["user_id"].(float64)))
        c.Next()
    }
}
```

### **Environment Configuration**

**Backend Environment Variables:**
```bash
# Database Configuration
DATABASE_URL=sykell:password@tcp(mysql:3306)/sykell_crawler?charset=utf8mb4&parseTime=True&loc=Local

# Redis Configuration
REDIS_URL=redis:6379
REDIS_PASSWORD=          # Optional Redis password
REDIS_DB=0              # Redis database number

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRY=168h         # 7 days

# Server Configuration
PORT=8080
GIN_MODE=release        # Set to 'debug' for development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Crawler Configuration
CRAWLER_TIMEOUT=30s
CRAWLER_USER_AGENT=SykellBot/1.0
MAX_CONCURRENT_CRAWLS=10
```

**Frontend Environment Variables:**
```bash
# API Configuration
VITE_API_URL=http://localhost:8080/api/v1

# Application Configuration
VITE_APP_NAME=Sykell Web Crawler
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
```

### **Security Best Practices Implemented:**

1. **Input Validation**: All user inputs are validated and sanitized
2. **SQL Injection Prevention**: GORM provides automatic parameterization
3. **XSS Protection**: React's built-in escaping + CSP headers
4. **CORS Configuration**: Restrictive CORS policy with specific origins
5. **Rate Limiting**: Implemented at Gin middleware level
6. **Secure Headers**: Security headers for API responses
7. **Password Security**: bcrypt with proper salt rounds
8. **Token Security**: JWT with secure secrets and proper expiration

---

## 🚀 Development Workflow

### **Local Development Setup**

**1. Prerequisites:**
```bash
# Backend requirements
Go 1.21+
MySQL 8.0+
Redis 7+

# Frontend requirements
Node.js 18+
npm or yarn

# Optional
Docker & Docker Compose
```

**2. Backend Development:**
```bash
cd backend

# Install dependencies
go mod tidy

# Set up environment
cp .env.example .env
# Edit .env with your local database credentials

# Run database migrations (GORM auto-migrate)
go run cmd/main.go migrate

# Start development server with live reload
go install github.com/cosmtrek/air@latest
air

# Or run directly
go run cmd/main.go
# Server starts on http://localhost:8080
```

**3. Frontend Development:**
```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server with hot reload
npm run dev
# Server starts on http://localhost:3000

# Other useful commands
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint
npm run type-check # TypeScript checking
```

**4. Full Stack Development with Docker:**
```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f mysql

# Stop services
docker-compose down

# Clean up (removes volumes)
docker-compose down -v
```

### **API Endpoints Reference**

**Authentication Endpoints:**
```
POST   /api/v1/auth/register    # User registration
POST   /api/v1/auth/login       # User login
```

**Protected URL Management Endpoints:**
```
GET    /api/v1/urls             # List URLs with pagination/filtering
POST   /api/v1/urls             # Add new URL for crawling
GET    /api/v1/urls/:id         # Get detailed URL analysis
POST   /api/v1/urls/bulk        # Bulk operations (start/stop/delete/recrawl)
```

**Query Parameters for GET /api/v1/urls:**
```
?page=1                  # Page number (default: 1)
&limit=10               # Items per page (default: 10, max: 100)
&search=example.com     # Search in URL and title
&sort_by=created_at     # Sort field (url, title, status, created_at)
&sort_order=desc        # Sort direction (asc, desc)
```

**Example API Responses:**
```json
// GET /api/v1/urls
{
  "urls": [
    {
      "id": 1,
      "url": "https://example.com",
      "title": "Example Domain",
      "status": "done",
      "created_at": "2024-01-15T10:30:00Z",
      "results": [
        {
          "id": 1,
          "html_version": "HTML5",
          "title": "Example Domain",
          "h1_count": 1,
          "h2_count": 0,
          "internal_links": 5,
          "external_links": 2,
          "broken_links": 0,
          "has_login_form": false,
          "broken_urls": []
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### **Testing Strategy**

**Backend Testing:**
```bash
# Unit tests
go test ./internal/...

# Integration tests with test database
go test -tags=integration ./internal/...

# Coverage report
go test -coverprofile=coverage.out ./internal/...
go tool cover -html=coverage.out
```

**Frontend Testing:**
```bash
# Unit tests with Vitest
npm run test

# Component tests
npm run test:components

# E2E tests with Playwright (if configured)
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## 📊 Performance Considerations

### **Backend Optimizations:**
1. **Database Indexing**: Strategic indexes on frequently queried columns
2. **Connection Pooling**: GORM connection pool with proper limits
3. **Query Optimization**: Preloading relationships to avoid N+1 queries
4. **Caching Strategy**: Redis for session storage and job queues
5. **Async Processing**: Background workers for CPU-intensive crawling
6. **Rate Limiting**: Prevent API abuse and crawl target overloading

### **Frontend Optimizations:**
1. **Code Splitting**: Lazy loading of route components
2. **React Query Caching**: Intelligent server state caching
3. **Optimistic Updates**: Immediate UI feedback for better UX
4. **Virtual Scrolling**: For large data tables (future enhancement)
5. **Image Optimization**: Lazy loading and responsive images
6. **Bundle Optimization**: Tree shaking and dead code elimination

### **Monitoring & Observability:**
```bash
# Application metrics
- Response times
- Database query performance
- Queue processing rates
- Error rates and types
- Resource utilization

# Business metrics
- URLs crawled per hour
- Success/failure rates
- Popular crawl targets
- User engagement metrics
```

---

## 🚀 Deployment & Scaling

### **Production Deployment:**

**1. Environment Preparation:**
```bash
# Production environment variables
export DATABASE_URL="user:pass@tcp(prod-mysql:3306)/sykell_crawler"
export REDIS_URL="prod-redis:6379"
export JWT_SECRET="super-secure-production-secret-32-characters-minimum"
export GIN_MODE="release"
export FRONTEND_URL="https://your-domain.com"
```

**2. Database Setup:**
```sql
-- Production database with optimizations
CREATE DATABASE sykell_crawler CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Additional production indexes
CREATE INDEX idx_urls_composite ON urls(status, created_at DESC);
CREATE INDEX idx_crawl_results_latest ON crawl_results(url_id, created_at DESC);
```

**3. Docker Production Build:**
```bash
# Multi-stage build for smaller images
docker build -t sykell-backend:latest ./backend
docker build -t sykell-frontend:latest ./frontend

# Deploy with production compose
docker-compose -f docker-compose.prod.yml up -d
```

### **Scaling Strategies:**

**Horizontal Scaling:**
1. **Load Balancer**: Nginx/HAProxy for backend API
2. **Database Replication**: Master-slave setup for read scaling
3. **Redis Cluster**: For high-availability job processing
4. **CDN Integration**: Static asset delivery
5. **Microservices Split**: Separate crawler service

**Vertical Scaling:**
1. **Database Optimization**: Query tuning and indexing
2. **Memory Management**: Go garbage collection tuning
3. **CPU Utilization**: Concurrent crawling limits
4. **Storage Optimization**: Log rotation and data archiving

This architecture demonstrates **production-ready practices** with proper separation of concerns, comprehensive error handling, security best practices, and excellent developer experience. The project successfully balances **KISS** (Keep It Simple) and **DRY** (Don't Repeat Yourself) principles while maintaining scalability and maintainability.

---

## 📚 Additional Resources

**Documentation:**
- [Go Gin Framework](https://gin-gonic.com/)
- [GORM Documentation](https://gorm.io/)
- [React Query Guide](https://tanstack.com/query/latest)
- [TailwindCSS Documentation](https://tailwindcss.com/)

**Best Practices:**
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Database Design Principles](https://en.wikipedia.org/wiki/Database_design)

**Security Guidelines:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Go Security Checklist](https://github.com/Checkmarx/Go-SCP)