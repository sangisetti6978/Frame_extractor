# MongoDB Database Setup

## Atlas Connection

1. Create MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
2. Add your IP to network access
3. Create database user with admin privileges
4. Get connection string
5. Add to backend `.env`:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/video_extractor
```

## Local Setup

For development:

```bash
# Start MongoDB
mongod

# Initialize database
mongo < database/scripts/init_mongo.js

# Create indexes
mongo < database/scripts/indexes.js
```

## Collections

- **users** - User accounts
- **folder_configs** - User folder configurations
- **captured_images** - Extracted frames metadata
- **video_uploads** - Video upload records

## Schemas

JSON Schema validation is applied via scripts in `schemas/`
