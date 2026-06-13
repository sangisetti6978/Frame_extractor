# Frontend-Backend Connection Quick Reference

## 🚀 Start the Application

### Windows
```bash
start.bat
```

### macOS/Linux
```bash
chmod +x start.sh
./start.sh
```

## 📍 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React application |
| Backend API | http://localhost:8000/api | REST endpoints |
| Admin Panel | http://localhost:8000/admin/ | Django admin |

## 🔑 Test Credentials

After registering in the app, use those credentials to login.

### First Time Setup
1. **Register**: Click "Register" on frontend → Create account
2. **Login**: Use registered credentials
3. **Upload Video**: Test backend connection by uploading a video

## 📡 API Quick Test (with curl/Postman)

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "securepass123"
  }'
```

Response includes `access` token - copy it for authenticated requests

### Get Videos (with token)
```bash
curl -X GET http://localhost:8000/api/videos/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔧 Manual Start (If start scripts fail)

### Terminal 1: Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # Windows: activate
# source .venv/bin/activate  # macOS/Linux: uncomment this
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

## ✅ Health Check

All working if:
- ✓ Frontend loads at http://localhost:5173
- ✓ Can register/login on frontend
- ✓ Can upload video
- ✓ Backend API responds at http://localhost:8000/api/videos/
- ✓ No CORS errors in browser console

## ❌ Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS Error | Backend .env has `CORS_ALLOWED_ORIGINS=http://localhost:5173` |
| 401 Unauthorized | Login again to refresh access token |
| Connection Refused | Ensure backend running on port 8000 |
| Database Errors | Run `python manage.py migrate` |
| Module Not Found | Run `pip install -r requirements.txt` |
| Port Already in Use | Change port in start script or kill process using port |

## 📚 Full Documentation

See [FRONTEND_BACKEND_SETUP.md](FRONTEND_BACKEND_SETUP.md) for comprehensive setup guide.

## 🏗️ Architecture

```
Frontend (React)
     ↓ HTTP/REST
Axios API Client
     ↓
Backend (Django DRF)
     ↓
Database (SQLite/MongoDB)
```

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend returns `access_token` + `refresh_token`
3. Frontend stores in localStorage
4. Each request includes `Authorization: Bearer <token>`
5. On 401, user redirected to login

## 📁 Key Files

```
Frontend Services:
- src/services/api.js          # Axios client with JWT handling
- src/services/authApi.js      # Login/Register
- src/services/videoApi.js     # Video/Image uploads
- src/services/configApi.js    # Configuration management

Backend Endpoints:
- video_extractor/api/views.py # REST endpoints
- video_extractor/auth/views.py # Authentication
- video_extractor/settings.py   # CORS & JWT config
```

## 🎯 Next Steps

1. Test video upload functionality
2. Set up FFmpeg for frame extraction
3. Implement blur detection with OpenCV
4. Configure database for production
5. Deploy to cloud service

---

**Status**: ✅ Frontend-Backend Connected and Ready for Testing
