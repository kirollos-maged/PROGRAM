# PROGRAM - Online Learning Platform

A full-stack online course learning platform with modern architecture, built for scalability and user experience.

## 🎯 Features

### Core Platform
- **User Management**: Registration, authentication, profiles, role-based access
- **Course System**: Browse, enroll, track progress, certificates
- **Video Learning**: Interactive player with bookmarks and navigation
- **Quizzes & Assessments**: Multiple choice questions with scoring
- **Instructor Tools**: Course creation, student management, analytics
- **Admin Panel**: System monitoring, user management, feature flags

### Technical Features
- **Modern UI**: Responsive design with dark/light mode
- **Real-time**: Live progress tracking and notifications
- **Security**: JWT authentication, rate limiting, CSRF protection
- **Performance**: Optimized queries, caching, CDN-ready
- **Scalability**: Microservices-ready architecture

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Node.js       │    │   PostgreSQL    │
│   Frontend      │◄──►│   Backend API   │◄──►│   Database      │
│   (Port 3000)   │    │   (Port 4000)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Redis       │    │   File Storage  │
                       │   Cache/Queue   │    │   (S3/CDN)      │
                       │   (Port 6379)   │    │                 │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- Git

### One-Command Setup

```bash
# Clone the repository
git clone <repository-url>
cd PROGRAM

# Deploy with Docker (includes database setup)
./deploy.sh

# Or for production
./deploy.sh prod
```

That's it! The application will be running at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Database**: localhost:5432

## 🛠️ Manual Setup (Alternative)

### Backend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
   If you run the backend locally while PostgreSQL/Redis are in Docker, use `localhost` in `DATABASE_URL` and `REDIS_URL`.

3. **Database setup**:
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d postgres redis

   # Run migrations
   npm run migrate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with API URL
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## 📋 Environment Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/program
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-secure-access-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
REFRESH_TOKEN_PEPPER=your-refresh-token-pepper
BCRYPT_ROUNDS=12
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 🐳 Docker Commands

```bash
# Development
docker-compose up -d                 # Start all services
docker-compose logs -f               # View logs
docker-compose down                  # Stop services

# Production
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f

# Database management
docker-compose exec postgres psql -U postgres -d program
```

## 📚 API Documentation

### Authentication
```
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # User login
POST /api/v1/auth/refresh      # Refresh access token
POST /api/v1/auth/logout       # Logout user
```

### Courses
```
GET  /api/v1/courses           # List courses
GET  /api/v1/courses/:id       # Get course details
POST /api/v1/courses/:id/enroll # Enroll in course
```

### Learning
```
GET  /api/v1/lessons/:id        # Get lesson
POST /api/v1/lessons/:id/complete # Mark lesson complete
POST /api/v1/videos/:id/progress # Update video progress
POST /api/v1/videos/:id/bookmark # Add video bookmark
```

## 🧪 Testing

### Backend Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm run test          # Run Playwright tests
npx playwright test   # Run E2E tests
```

## 🚢 Deployment

### Production Checklist
- [ ] Update all secrets in `.env`
- [ ] Configure domain and SSL certificates
- [ ] Set up monitoring (logs, metrics)
- [ ] Configure backup strategy
- [ ] Test all features end-to-end

### Deployment Options

#### Vercel + Railway (Recommended)
1. **Frontend**: Deploy to Vercel
2. **Backend**: Deploy to Railway/Heroku
3. **Database**: Use Railway PostgreSQL
4. **Redis**: Use Upstash Redis

#### Docker Production
```bash
./deploy.sh prod
```

#### Manual Production
```bash
# Backend
npm run build
npm start

# Frontend
npm run build
npm start
```

## 🔧 Development

### Code Quality
```bash
# Backend
npm run lint          # ESLint
npm run format        # Prettier

# Frontend
cd frontend
npm run lint
npm run type-check
```

### Database Management
```bash
# Create migration
npm run migrate:create -- migration_name

# Run migrations
npm run migrate

# Rollback
npm run migrate:rollback
```

## 📊 Monitoring & Analytics

### Built-in Monitoring
- Request logging with Morgan
- Error tracking with custom middleware
- Database query monitoring
- Redis cache hit/miss ratios

### Recommended Tools
- **Sentry**: Error tracking
- **DataDog**: Application monitoring
- **PostHog**: User analytics
- **Sentry**: Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Update documentation

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: See `/docs` folder

---

**Happy Learning! 🎓**

