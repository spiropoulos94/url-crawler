# Sykell Web Crawler

A full-stack web application that crawls websites and provides detailed analysis including HTML version detection, heading counts, link analysis, and broken link identification.

## 🚀 Features

### Backend (Go)
- **Scalable Architecture**: Clean separation with handlers, services, and repositories
- **Redis Job Queue**: Asynchronous URL processing for high scalability  
- **JWT Authentication**: Secure API access with token-based auth
- **MySQL Database**: Robust data persistence with GORM
- **Comprehensive Crawling**: HTML version, headings, links, login form detection
- **Error Handling**: Graceful error handling throughout the application
- **Docker Support**: Containerized for easy deployment

### Frontend (React + TypeScript)
- **Modern Stack**: React 18, TypeScript, Vite, TailwindCSS
- **Responsive Design**: Mobile-first responsive UI
- **Advanced Table**: Sortable, paginated, filterable URL dashboard
- **Real-time Updates**: Live status updates via React Query
- **Data Visualization**: Charts showing link distribution and heading analysis
- **Bulk Operations**: Start/stop/delete/recrawl multiple URLs
- **Detailed Analysis**: Per-URL breakdown with charts and broken links

## 🛠 Technology Stack

### Backend
- **Go 1.21** - Programming language
- **Gin** - HTTP web framework
- **GORM** - ORM for database operations
- **MySQL 8.0** - Primary database
- **Redis 7** - Job queue and caching
- **JWT** - Authentication tokens
- **Docker** - Containerization

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Server state management
- **React Table** - Advanced table functionality
- **Recharts** - Data visualization
- **Lucide React** - Icon library

## 🚦 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sykell
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Health check: http://localhost:8080/health

4. **Create an account**
   - Click "Don't have an account? Create one"
   - Register with username (min 3 chars) and password (min 6 chars)
   - Login with your credentials

### Option 2: Local Development

#### Backend Setup
```bash
cd backend

# Install dependencies
go mod tidy

# Copy environment file
cp .env.example .env

# Start MySQL and Redis (via Docker)
docker-compose up -d mysql redis

# Run the backend
go run cmd/main.go
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📊 Usage

### Adding URLs
1. Use the "Add New URL" form on the dashboard
2. Enter a website URL (with or without http/https)
3. Click "Add URL" - it will be queued for crawling automatically

### Managing URLs
- **View Results**: Click the eye icon to see detailed analysis
- **Bulk Actions**: Select multiple URLs using checkboxes
  - **Start**: Begin crawling selected URLs
  - **Stop**: Stop crawling (marks as done)  
  - **Recrawl**: Re-analyze selected URLs
  - **Delete**: Remove URLs from the system

### Dashboard Features
- **Search**: Filter URLs by URL or title
- **Sorting**: Click column headers to sort
- **Pagination**: Navigate through large URL lists
- **Status Tracking**: Real-time crawl status updates

### Detailed Analysis
Click any URL to view:
- **Overview**: HTML version, total links, broken links, login form detection
- **Charts**: Link distribution (pie chart), heading distribution (bar chart)
- **Broken Links**: Complete list with status codes and error messages

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=sykell:password@tcp(localhost:3307)/sykell_crawler?charset=utf8mb4&parseTime=True&loc=Local
REDIS_URL=localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
PORT=8080
```

#### Frontend
```bash
VITE_API_URL=http://localhost:8080/api/v1
```

## 🏗 Architecture

### Backend Architecture
```
├── cmd/                 # Application entry points
├── internal/
│   ├── handlers/        # HTTP request handlers
│   ├── services/        # Business logic layer
│   ├── repositories/    # Data access layer
│   ├── models/          # Database models
│   ├── api/            # API server setup
│   ├── auth/           # Authentication logic
│   ├── crawler/        # Web crawling service
│   ├── queue/          # Redis job queue
│   └── database/       # Database connection
└── pkg/
    ├── config/         # Configuration management
    └── utils/          # Utility functions
```

### Frontend Architecture
```
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API communication
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test ./...
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📦 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### URL Management Endpoints (Authenticated)
- `GET /api/v1/urls` - List URLs with pagination/filtering
- `POST /api/v1/urls` - Add new URL for crawling
- `GET /api/v1/urls/:id` - Get URL details with results
- `POST /api/v1/urls/bulk` - Bulk actions on multiple URLs

### Response Examples

#### GET /api/v1/urls
```json
{
  "urls": [...],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

#### URL Object
```json
{
  "id": 1,
  "url": "https://example.com",
  "title": "Example Site",
  "status": "done",
  "created_at": "2024-01-01T12:00:00Z",
  "results": [{
    "html_version": "HTML5",
    "internal_links": 15,
    "external_links": 5,
    "broken_links": 2,
    "has_login_form": true,
    "broken_urls": [...]
  }]
}
```

## 🚀 Deployment

### Production Docker Compose
```yaml
# Override docker-compose.yml for production
version: '3.8'
services:
  backend:
    environment:
      JWT_SECRET: "your-production-secret-key"
      DATABASE_URL: "production-db-url"
  
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: "secure-root-password"
      MYSQL_PASSWORD: "secure-password"
```

### Health Checks
- Backend: `GET /health`
- Database: MySQL ping check
- Redis: Redis ping check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

If you encounter any issues:
1. Check the logs: `docker-compose logs`
2. Verify all services are running: `docker-compose ps`
3. Ensure ports 3000, 8080, 3307, 6379 are available

## 🎯 Development Notes

This application was built with production-quality practices:
- **Clean Architecture**: Separation of concerns with clear layers
- **Error Handling**: Comprehensive error handling and logging
- **Security**: JWT authentication, input validation, CORS support
- **Scalability**: Redis job queue for handling concurrent crawls
- **Type Safety**: Full TypeScript implementation
- **Testing**: Test structure for both frontend and backend
- **Docker**: Full containerization for consistent environments