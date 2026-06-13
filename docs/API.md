# Video Frame Extractor API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### POST /auth/register/
Register new user

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### POST /auth/login/
User login

**Request:**
```json
{
  "username": "john_doe",
  "password": "secure_password123"
}
```

### Images

#### GET /images/
List captured images (paginated)

**Query Parameters:**
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20)

#### GET /images/{id}/
Get image details

#### GET /images/by_video/
Filter images by source video

**Query Parameters:**
- `video_name` - Source video filename

### Videos

#### GET /videos/
List user's videos

#### POST /videos/
Upload new video

#### GET /videos/{id}/
Get video details

## Error Responses

```json
{
  "error": "Error message"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error
