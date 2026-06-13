// MongoDB initialization script
// Run: mongo < init_mongo.js

db = db.getSiblingDB("video_extractor");

// Create collections with schema validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email"],
      properties: {
        _id: { bsonType: "objectId" },
        username: { bsonType: "string" },
        email: { bsonType: "string" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("folder_configs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "folder_path"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "objectId" },
        folder_path: { bsonType: "string" },
        folder_name: { bsonType: "string" }
      }
    }
  }
});

db.createCollection("captured_images", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "image_path"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "objectId" },
        image_path: { bsonType: "string" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("video_uploads", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "video_path"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "objectId" },
        video_path: { bsonType: "string" },
        status: { bsonType: "string" }
      }
    }
  }
});

print("MongoDB collections created successfully");
