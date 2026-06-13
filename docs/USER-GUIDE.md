# User Guide - Video Frame Extractor

## Getting Started

### 1. Registration & Login

- Create account with username, email, and password
- Login to access dashboard

### 2. Setup Configuration

- Navigate to Setup page
- Select output folder for extracted frames
- Choose image format (PNG, JPG, WebP, BMP)
- Enable blur detection if desired
- Set compression quality (0-100)

### 3. Upload Video

- Go to Dashboard
- Click "Upload Video"
- Select video file
- Video metadata will be extracted automatically

### 4. Auto-Capture Frames

- Play video in the player
- Frames are automatically captured when pause
- Adjust capture intervals in settings
- View captured frames in real-time

### 5. Blur Detection

If enabled, all captured frames are analyzed for blur:
- Blurred images are marked with warning icon
- Blur score shows confidence level (0 to 1)
- Filter gallery to hide blurred frames

### 6. Download & Export

- View captured frames in Gallery
- Download individual frames
- Export entire capture session as ZIP

## Features

### Video Player
- Play/pause controls
- Seek to timestamp
- Speed controls
- Full-screen mode

### Image Gallery
- Grid/list view
- Filter by blur status
- Sort by date/size
- Batch operations

### Configuration Management
- Multiple output folders
- Different settings per folder
- Quick thumbnail preview

## Tips & Tricks

1. **Optimal Capture**: Use lower frame rates (0.5-1 fps) to reduce file size
2. **Blur Detection**: Works best with clear videos; adjust threshold in settings
3. **File Organization**: Use descriptive folder names for better organization
4. **Batch Processing**: Process multiple videos sequentially

## Troubleshooting

### Frames not captured
- Check output folder permissions
- Ensure sufficient disk space
- Verify video format compatibility

### Blur detection inaccurate
- Check video quality
- Adjust blur threshold in settings
- Update OpenCV library

### Upload fails
- Check file size limit (default: 2GB)
- Verify video codec compatibility
- Check internet connection
