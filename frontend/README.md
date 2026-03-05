# CodelessAI Admin Dashboard

Multi-Tenant AI Voice Assistant Platform Administration Panel

## Overview

The CodelessAI Admin Dashboard is a comprehensive web-based administration interface for managing the multi-tenant SaaS platform that powers AI voice assistant mobile applications.

## Features

- **Dashboard Overview**: System metrics, charts, and real-time analytics
- **Tenant Management**: Monitor and manage platform users
- **Assistant Management**: Configure and monitor AI assistants
- **Knowledge Base**: Manage tenant knowledge bases
- **Conversation Monitoring**: Inspect user-assistant interactions
- **AI Usage Analytics**: Track API usage and performance metrics
- **System Health**: Monitor service status and performance
- **Error Monitoring**: View system logs and error tracking
- **System Configuration**: Configure LLM providers and rate limits

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios for API communication
- **Authentication**: JWT-based admin authentication

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running CodelessAI FastAPI backend

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ADMIN_SECRET=your_admin_secret_here
JWT_SECRET=your_jwt_secret_here
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Docker Deployment

Build and run with Docker:

```bash
docker build -t codelessai-admin .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://your-api-url codelessai-admin
```

## API Integration

The dashboard integrates with the following FastAPI endpoints:

- `POST /admin/login` - Admin authentication
- `GET /admin/dashboard/metrics` - Dashboard metrics
- `GET /admin/tenants` - Tenant management
- `GET /admin/assistants` - Assistant management
- `GET /admin/knowledge` - Knowledge base management
- `GET /admin/conversations` - Conversation monitoring
- `GET /admin/analytics` - Usage analytics
- `GET /admin/logs` - Error logs
- `GET /health` - System health

## Project Structure

```
codelessai-admin/
├── app/
│   ├── dashboard/
│   │   ├── tenants/
│   │   ├── assistants/
│   │   ├── knowledge/
│   │   ├── conversations/
│   │   ├── analytics/
│   │   ├── health/
│   │   ├── logs/
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── MetricCard.tsx
│   └── DashboardCharts.tsx
├── services/
│   ├── api.ts
│   └── apiHelpers.ts
└── Dockerfile
```

## Authentication

Admin login is required to access the dashboard. The system uses JWT tokens for authentication with the FastAPI backend.

## License

Private - CodelessAI Platform