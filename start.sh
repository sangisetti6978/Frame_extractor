#!/bin/bash

# Quick start script for macOS/Linux - runs both frontend and backend

echo ""
echo "========================================"
echo "Auto-Frame-Extractor - Quick Start"
echo "========================================"
echo ""

# Check if running from correct directory
if [ ! -d "frontend" ]; then
    echo "Error: frontend folder not found. Please run from project root."
    exit 1
fi

if [ ! -d "backend" ]; then
    echo "Error: backend folder not found. Please run from project root."
    exit 1
fi

echo "Starting application..."
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "backend/.venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv .venv
    cd ..
fi

echo ""
echo "========================================"
echo "Starting Backend (Django)"
echo "========================================"
echo "Backend will run on: http://localhost:8000"
echo ""

# Activate venv and start backend
cd backend
source .venv/bin/activate
pip install -q -r requirements.txt 2>/dev/null
python manage.py migrate -q 2>/dev/null
python manage.py runserver &
BACKEND_PID=$!
cd ..

sleep 3

echo ""
echo "========================================"
echo "Starting Frontend (React + Vite)"
echo "========================================"
echo "Frontend will run on: http://localhost:5173"
echo ""

# Install frontend dependencies if needed and start
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install -q
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "✓ Services Started"
echo "========================================"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo "Admin:    http://localhost:8000/admin/"
echo ""
echo "Press Ctrl+C to stop all services..."
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
