# 🎥 Video Frame Extractor

A full-stack application for extracting frames from videos with auto-capture on pause, blur detection, and intelligent image management.

## Features

✨ **Core Features**
- 🎬 Extract frames from videos with FFmpeg
- ⏸️ Auto-capture frames on pause
- 🔍 AI-powered blur detection with OpenCV
- 📸 Interactive image gallery
- 🎨 Responsive React UI
- 🔐 Secure JWT authentication
- 📦 MongoDB for scalable data storage

## Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router
- Axios

**Backend:**
- Django 4.2 + DRF
- MongoDB + djongo
- FFmpeg + OpenCV
- JWT Authentication

**DevOps:**
- Docker & Docker Compose
- MongoDB Atlas
- Environment-based configuration

## Project Structure

```
video-frame-extractor/
├── frontend/          # React SPA
├── backend/           # Django REST API
├── database/          # MongoDB scripts
├── docs/              # Documentation
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- Python 3.9+
- Node.js 16+
- MongoDB

### Option 1: Docker (Recommended)

```bash
# Clone and navigate
git clone <repo-url>
cd video-frame-extractor

# Start all services
docker-compose up -d

# Access
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# MongoDB: localhost:27017
```

### Option 2: Local Development

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

## Configuration

Edit `.env` file at project root:

```env
DEBUG=True
SECRET_KEY=your-secret-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/video_extractor
CORS_ALLOWED_ORIGINS=http://localhost:5173
JWT_SECRET=your-jwt-secret
```

## API Documentation

See [docs/API.md](docs/API.md) for detailed API endpoints and examples.

### Key Endpoints

```
POST   /api/auth/register/  - Register user
POST   /api/auth/login/     - Login user
GET    /api/images/         - Get captured images
POST   /api/videos/         - Upload video
GET    /api/videos/         - List videos
```

## Usage

1. **Register** - Create account at `/register`
2. **Setup** - Configure output folder and format
3. **Upload** - Add video file
4. **Extract** - Play video and auto-capture frames
5. **Gallery** - View, filter, and download frames

## Database Schema

### Collections
- **users** - User accounts
- **folder_configs** - Output configurations
- **captured_images** - Frame metadata
- **video_uploads** - Video records

See [database/schemas/](database/schemas/) for detailed schemas.

## Development

### Running Tests
```bash
cd backend
python manage.py test

cd frontend
npm run test
```

### Linting
```bash
# Backend
cd backend
flake8 .

# Frontend
cd frontend
npm run lint
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Docker deployment
- AWS/Azure setup
- Production checklist
- Environment configuration

## Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or suggestions:
- Open GitHub Issues
- Check [docs/USER-GUIDE.md](docs/USER-GUIDE.md)
- Review API documentation

---

**Made with ❤️ for video enthusiasts**
