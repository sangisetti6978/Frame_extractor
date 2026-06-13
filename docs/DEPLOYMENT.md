# Deployment Guide

## Docker Deployment

### Build and Run with Docker Compose

```bash
docker-compose up -d
```

This will start:
- React frontend on http://localhost:5173
- Django backend on http://localhost:8000
- MongoDB on port 27017

### Environment Variables

Create `.env` file in project root:

```env
# Django
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/video_extractor

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=86400
```

## Cloud Deployment

### AWS Deployment

1. Use EC2 for Django backend
2. Use CloudFront/S3 for React frontend
3. Use MongoDB Atlas for database

### Azure Deployment

1. Use App Service for Django
2. Use Static Web Apps for React
3. Use Azure Database for MongoDB

## Production Checklist

- [ ] Set DEBUG=False
- [ ] Update SECRET_KEY and JWT_SECRET
- [ ] Configure ALLOWED_HOSTS
- [ ] Setup HTTPS/SSL
- [ ] Configure CORS origins
- [ ] Setup environment-specific variables
- [ ] Configure logging
- [ ] Setup backup strategy
- [ ] Configure monitoring
