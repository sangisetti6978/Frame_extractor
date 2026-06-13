@echo off
REM Quick start script for Windows - runs both frontend and backend

echo.
echo ========================================
echo Auto-Frame-Extractor - Quick Start
echo ========================================
echo.

REM Check if running from correct directory
if not exist "frontend" (
    echo Error: frontend folder not found. Please run from project root.
    pause
    exit /b 1
)

if not exist "backend" (
    echo Error: backend folder not found. Please run from project root.
    pause
    exit /b 1
)

echo Starting application...
echo.

REM Create virtual environment if it doesn't exist
if not exist "backend\.venv" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv .venv
    cd ..
)

echo.
echo ========================================
echo Starting Backend (Django)
echo ========================================
echo Backend will run on: http://localhost:8000
echo.

REM Activate venv and start backend
cd backend
call .venv\Scripts\activate.bat
pip install -r requirements.txt -q
python manage.py migrate -q 2>nul
start /MIN "Backend - Django" python manage.py runserver
cd ..

timeout /t 3 /nobreak

echo.
echo ========================================
echo Starting Frontend (React + Vite)
echo ========================================
echo Frontend will run on: http://localhost:5173
echo.

REM Install frontend dependencies if needed and start
cd frontend
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install -q
)
start /MIN "Frontend - React" cmd /k npm run dev
cd ..

echo.
echo ========================================
echo ✓ Services Starting...
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo Admin:    http://localhost:8000/admin/
echo.
echo To stop services: Close the terminal windows
echo.
echo Press any key to continue...
pause
