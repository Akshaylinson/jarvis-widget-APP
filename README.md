# CodelessAI Platform — Dockerized Backend & Frontend Setup

Multi-Tenant AI Voice Assistant Platform with clean architecture

## 🏗 Project Structure

```
codelessai-platform/
│
├── backend/                 # FastAPI AI backend
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   └── main.py
│
├── frontend/               # Next.js admin dashboard
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   └── app/
│
├── mobile_app/            # Flutter voice assistant (not containerized)
│   ├── lib/
│   ├── android/
│   ├── ios/
│   └── pubspec.yaml
│
├── docker-compose.yml
└── .env
```

## 🐳 Docker Services

The platform runs the following containerized services:

- **Backend**: FastAPI AI backend (Port 8000)
- **Frontend**: Next.js admin dashboard (Port 3000)
- **PostgreSQL**: Database (Port 5432)
- **Redis**: Cache & sessions (Port 6379)

**Note**: The Flutter mobile app runs separately using Flutter tooling.

## ⚡ Quick Start

### Prerequisites
- Docker & Docker Compose
- Flutter SDK (for mobile app development)

### 1. Environment Setup
Configure your environment variables in `.env`:

```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/codelessai
REDIS_URL=redis://redis:6379
JWT_SECRET=supersecretkey_change_in_production
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 2. Start the Platform
Run the entire backend + frontend stack:

```bash
docker compose up --build
```

This command will:
- Build the backend container
- Build the frontend container  
- Start PostgreSQL database
- Start Redis cache
- Connect all services through Docker network

## 🌐 Service Access

After running `docker compose up --build`:

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:8000 | FastAPI backend |
| Admin Dashboard | http://localhost:3000 | Next.js admin panel |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |

## 📱 Mobile App Development

The Flutter mobile application connects to the backend API:

**Local Development:**
```dart
const String API_BASE_URL = 'http://localhost:8000';
```

**Production:**
```dart
const String API_BASE_URL = 'https://api.codelessai.com';
```

### Running the Mobile App
```bash
cd mobile_app
flutter pub get
flutter run
```

## 🔧 Development Workflow

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Full Stack Development
```bash
# Start all services
docker compose up --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## 📊 Architecture Overview

```
Mobile App (Flutter) ──HTTPS──> Backend (FastAPI)
                                    │
                        ┌───────────┼───────────┐
                        ▼           ▼           ▼
                   PostgreSQL    Redis    Object Storage
                        ▲
                        │
                   Admin Dashboard (Next.js)
```

## 🚀 Production Deployment

For production deployment:

1. Update environment variables in `.env`
2. Configure SSL certificates
3. Set up reverse proxy (nginx)
4. Use production database credentials
5. Enable Docker Compose production overrides

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🎯 Features

- **Multi-tenant SaaS architecture**
- **AI voice assistant with wake word detection**
- **Real-time conversation processing**
- **Admin dashboard for platform management**
- **Scalable microservices architecture**
- **Docker containerization for easy deployment**

The platform provides a complete AI voice assistant ecosystem with administrative controls and multi-tenant capabilities.