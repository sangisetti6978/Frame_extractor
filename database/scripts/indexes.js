// MongoDB indexes script
// Run: mongo < indexes.js

db = db.getSiblingDB("video_extractor");

// Create indexes for better query performance
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ created_at: -1 });

db.folder_configs.createIndex({ user_id: 1 });
db.folder_configs.createIndex({ is_active: 1 });
db.folder_configs.createIndex({ user_id: 1, is_active: 1 });

db.captured_images.createIndex({ user_id: 1 });
db.captured_images.createIndex({ source_video: 1 });
db.captured_images.createIndex({ user_id: 1, created_at: -1 });
db.captured_images.createIndex({ is_blurred: 1 });
db.captured_images.createIndex({ user_id: 1, is_blurred: 1 });

db.video_uploads.createIndex({ user_id: 1 });
db.video_uploads.createIndex({ status: 1 });
db.video_uploads.createIndex({ user_id: 1, created_at: -1 });

print("Indexes created successfully");
