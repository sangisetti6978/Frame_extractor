# Video Frame Extractor - Backend

Django REST API backend for the Video Frame Extractor application.

## Features

- 🐍 Django + DRF for API
- 📦 MongoDB integration with djongo
- 🔐 JWT Authentication
- 🎬 FFmpeg frame extraction
- 🔍 OpenCV blur detection
- 📸 Image gallery management

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Update .env with your settings
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Start server:
```bash
python manage.py runserver
```

## API Endpoints

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET/POST /api/images/` - Manage captured images
- `GET/POST /api/videos/` - Manage video uploads

## Project Structure

- `video_extractor/` - Django project settings
- `core/` - Main app with models and utilities
- `auth/` - Authentication endpoints
- `api/` - API viewsets and serializers
