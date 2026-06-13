# Frontend-Backend Connection Setup Guide

This document explains how to properly set up and run the auto-frame-extractor application with the frontend and backend connected.

## Project Architecture

- **Frontend**: React 18 + Vite (runs on `localhost:5173`)
- **Backend**: Django REST Framework (runs on `localhost:8000`)
- **Database**: SQLite (for development), MongoDB (optional for production)
- **Authentication**: JWT tokens with refresh token support

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- pip package manager
- Virtual environment (venv)

## Environment Configuration

Both frontend and backend are pre-configured with the correct environment variables in their respective `.env` files.

### Backend `.env` (already configured)
```
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
VITE_API_URL=http://localhost:8000/api
```

### Frontend `.env` (already configured)
```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Video Frame Extractor
```

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# From project root
docker-compose up -d
```

This will start:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:8000`
- MongoDB (if configured)

### Option 2: Manual Setup (Development)

#### Terminal 1: Start Backend Server

```bash
cd backend

# Activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate  # On Windows
# source .venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start development server
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

#### Terminal 2: Start Frontend Development Server

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register/` - Register new user
  ```json
  {
    "username": "user",
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login/` - Login user
  ```json
  {
    "username": "user",
    "password": "password123"
  }
  ```

### Video Endpoints

- `GET /api/videos/` - List all user videos
- `POST /api/videos/` - Upload new video
- `GET /api/videos/{id}/` - Get video details
- `DELETE /api/videos/{id}/` - Delete video
- `GET /api/videos/stats/` - Get video statistics

### Image Endpoints

- `GET /api/images/` - List all captured images
- `GET /api/images/?page=1` - Paginated list
- `GET /api/images/by_video/?video_name=video.mp4` - Get images from specific video
- `DELETE /api/images/{id}/` - Delete image
- `GET /api/images/stats/` - Get image statistics

### Configuration Endpoints

- `GET /api/config/` - List user configurations
- `POST /api/config/create_config/` - Create/update configuration
- `DELETE /api/config/delete_config/` - Delete configuration

## Frontend API Integration

The frontend uses an axios instance with automatic JWT token handling:

### API Client (`src/services/api.js`)

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  }
})

// Automatically adds JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handles 401 unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Service Modules

#### Authentication Service (`src/services/authApi.js`)
```javascript
authApi.register(username, email, password)
authApi.login(username, password)
authApi.logout()
```

#### Video Service (`src/services/videoApi.js`)
```javascript
videoApi.listVideos(page)
videoApi.uploadVideo(file, onUploadProgress)
videoApi.getVideo(id)
videoApi.deleteVideo(id)
```

#### Image Service (`src/services/videoApi.js`)
```javascript
imageApi.listImages(page, videoName)
imageApi.filterByVideo(videoName)
imageApi.getImage(id)
imageApi.deleteImage(id)
```

#### Config Service (`src/services/configApi.js`)
```javascript
configApi.getConfig()
configApi.createFolder(data)
configApi.updateConfig(data)
configApi.deleteFolder(id)
```

## Token-Based Authentication Flow

1. **Registration/Login**: User credentials are sent to backend
2. **Token Received**: Backend returns `access_token` and `refresh_token`
3. **Token Storage**: Tokens are stored in `localStorage`
4. **Auto-Attach**: Each API request automatically includes `Authorization: Bearer <token>`
5. **Token Expiry**: On 401 response, tokens are cleared and user is redirected to login

## Common Issues & Solutions

### CORS Errors
- **Issue**: "Access to XMLHttpRequest blocked by CORS policy"
- **Solution**: Ensure `CORS_ALLOWED_ORIGINS` in backend `.env` includes frontend URL
- **Check**: Backend should have `http://localhost:5173` in CORS origins

### 401 Unauthorized
- **Issue**: "401 Unauthorized" on API requests
- **Cause**: Token not being sent or token expired
- **Solution**: Login again to get new tokens

### API Connection Refused
- **Issue**: "Connection refused" when accessing backend
- **Solution**: Ensure backend server is running on `http://localhost:8000`
- **Check**: Run `python manage.py runserver` from backend directory

### Database Errors
- **Issue**: "no such table" or database errors
- **Solution**: Run migrations
  ```bash
  python manage.py makemigrations
  python manage.py migrate
  ```

## Testing the Connection

### Using Frontend UI
1. Open `http://localhost:5173` in browser
2. Click "Register" and create an account
3. Login with your credentials
4. Upload a video to test backend connectivity

### Using Postman/curl

#### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

#### List Videos (with token)
```bash
curl -X GET http://localhost:8000/api/videos/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## File Structure

```
auto-frame-extractor/
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── services/     # API calling modules (api.js, authApi.js, etc.)
│   │   ├── context/      # React Context (AuthContext, UserContext, etc.)
│   │   ├── components/   # React components
│   │   └── pages/        # Page components
│   ├── .env              # Frontend environment variables
│   └── vite.config.js
├── backend/              # Django REST API
│   ├── video_extractor/
│   │   ├── auth/        # Authentication views
│   │   ├── api/         # API views and URLs
│   │   ├── core/        # Core models and serializers
│   │   └── settings.py
│   ├── .env             # Backend environment variables
│   └── requirements.txt
└── docker-compose.yml    # Docker configuration
```

## Next Steps

1. Set up video processing (FFmpeg integration)
2. Implement frame extraction logic
3. Add blur detection using OpenCV
4. Set up MongoDB for production
5. Deploy to cloud (AWS, Azure, GCP)

## Additional Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Database Schema](./database/schemas/)
- [API Documentation](./docs/API.md)
