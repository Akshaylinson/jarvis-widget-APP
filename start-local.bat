@echo off
echo Starting CodelessAI Platform Locally...

echo.
echo [1/4] Starting PostgreSQL (Docker only)...
docker run -d --name codelessai_db -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=codelessai postgres:15

echo.
echo [2/4] Starting Redis (Docker only)...
docker run -d --name codelessai_redis -p 6379:6379 redis:7

echo.
echo [3/4] Starting Backend...
cd backend
start cmd /k "pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo [4/4] Starting Frontend...
cd ../frontend
start cmd /k "npm install && npm run dev"

echo.
echo ========================================
echo   CodelessAI Platform Started!
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo Database: localhost:5432
echo Redis:    localhost:6379
echo ========================================

pause