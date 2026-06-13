from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from video_extractor.core.models import CapturedImage, VideoUpload, FolderConfig
from video_extractor.core.serializers import CapturedImageSerializer, VideoUploadSerializer
from video_extractor.core.utils.ffmpeg_utils import get_video_info
import os
from django.core.files.storage import default_storage
from django.conf import settings


class ImageViewSet(viewsets.ModelViewSet):
    """Captured images API"""
    serializer_class = CapturedImageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        return CapturedImage.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def capture_frame(self, request):
        """Save a single captured frame from the video player"""
        try:
            image_file = request.FILES.get('image')
            if not image_file:
                return Response(
                    {'error': 'No image file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            video_id = request.data.get('video_id')
            timestamp = float(request.data.get('timestamp', 0))
            width = int(request.data.get('width', 0))
            height = int(request.data.get('height', 0))
            video_name = request.data.get('video_name', 'unknown')
            
            # Save the frame image to media/frames/<user_id>/<video_id>/
            frame_dir = f'frames/{request.user.id}/{video_id}'
            # Generate a unique filename using timestamp
            timestamp_str = f"{timestamp:.3f}".replace('.', '_')
            filename = f'frame_{timestamp_str}.png'
            file_path = default_storage.save(
                f'{frame_dir}/{filename}',
                image_file
            )
            
            full_path = os.path.join(settings.MEDIA_ROOT, file_path)
            file_size = os.path.getsize(full_path)
            
            # Run blur detection
            is_blurred = False
            blur_score = None
            try:
                from video_extractor.core.utils.opencv_utils import detect_blur
                is_blurred, blur_score = detect_blur(full_path)
            except Exception as blur_err:
                print(f"Blur detection failed: {blur_err}")
            
            # Build the URL for serving the image
            image_url = f'/media/{file_path.replace(os.sep, "/")}'
            
            # Create CapturedImage record
            captured = CapturedImage.objects.create(
                user=request.user,
                image_path=file_path,
                image_url=image_url,
                source_video=video_name,
                timestamp=timestamp,
                is_blurred=is_blurred,
                blur_score=blur_score,
                file_size=file_size,
                width=width,
                height=height,
            )
            
            # Update the video's frame count
            if video_id:
                try:
                    video = VideoUpload.objects.get(id=video_id, user=request.user)
                    video.frames_extracted = CapturedImage.objects.filter(
                        user=request.user, source_video=video_name
                    ).count()
                    video.save()
                except VideoUpload.DoesNotExist:
                    pass
            
            serializer = self.get_serializer(captured)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def by_video(self, request):
        """Get images by source video"""
        video_name = request.query_params.get('video_name')
        images = self.get_queryset().filter(source_video=video_name)
        serializer = self.get_serializer(images, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get image statistics"""
        queryset = self.get_queryset()
        total = queryset.count()
        blurred = queryset.filter(is_blurred=True).count()
        clear = total - blurred
        return Response({
            'total': total,
            'blurred': blurred,
            'clear': clear
        })


class VideoViewSet(viewsets.ModelViewSet):
    """Video uploads API"""
    serializer_class = VideoUploadSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return VideoUpload.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Handle video upload"""
        try:
            video_file = request.FILES.get('video')
            if not video_file:
                return Response(
                    {'error': 'No video file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save the file temporarily to extract metadata
            file_path = default_storage.save(
                f'videos/{request.user.id}/{video_file.name}',
                video_file
            )
            
            # Try to extract video metadata
            duration = 0
            width = 0
            height = 0
            fps = 0
            codec = ''
            
            try:
                full_file_path = os.path.join(settings.MEDIA_ROOT, file_path)
                print(f"DEBUG: Attempting to extract metadata from: {full_file_path}")
                print(f"DEBUG: File exists: {os.path.exists(full_file_path)}")
                video_info = get_video_info(full_file_path)
                print(f"DEBUG: Video info extracted: {video_info}")
                duration = video_info['duration']
                width = video_info['width']
                height = video_info['height']
                fps = video_info['fps']
                codec = video_info.get('codec', '')
                print(f"DEBUG: Metadata stored - Duration: {duration}, Resolution: {width}x{height}, FPS: {fps}")
            except Exception as e:
                # FFmpeg not available or error - continue without metadata
                import traceback
                print(f"ERROR: Could not extract video metadata: {str(e)}")
                print(f"ERROR: Traceback: {traceback.format_exc()}")
            
            # Create video upload record
            video = VideoUpload.objects.create(
                user=request.user,
                video_name=video_file.name,
                video_size=video_file.size,
                video_path=file_path,
                status='uploaded',
                duration=duration,
                width=width,
                height=height,
                fps=fps,
                codec=codec
            )
            
            serializer = self.get_serializer(video)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get video statistics"""
        queryset = self.get_queryset()
        total = queryset.count()
        processing = queryset.filter(status='processing').count()
        completed = queryset.filter(status='completed').count()
        failed = queryset.filter(status='failed').count()
        return Response({
            'total': total,
            'processing': processing,
            'completed': completed,
            'failed': failed
        })
    
    @action(detail=True, methods=['post'])
    def extract_frames(self, request, pk=None):
        """Extract frames from video"""
        try:
            video = self.get_object()
            if video.status == 'completed':
                return Response(
                    {'error': 'Frames already extracted for this video'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get extraction parameters from request
            fps = float(request.data.get('fps', 1))  # Default: 1 frame per second
            image_format = request.data.get('format', 'png')
            
            # Mark as processing
            video.status = 'processing'
            video.save()
            
            # Run extraction in a thread so we can return immediately
            import threading
            thread = threading.Thread(
                target=self._do_extract_frames,
                args=(video, request.user, fps, image_format)
            )
            thread.daemon = True
            thread.start()
            
            return Response({
                'message': 'Frame extraction started',
                'video_id': video.id,
                'status': 'processing'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _do_extract_frames(self, video, user, fps, image_format):
        """Background task to extract frames from video"""
        from video_extractor.core.utils.ffmpeg_utils import extract_frames as ffmpeg_extract
        from video_extractor.core.utils.opencv_utils import detect_blur, get_image_info
        
        try:
            # Build paths
            video_file_path = os.path.join(settings.MEDIA_ROOT, video.video_path)
            output_dir = os.path.join(
                settings.MEDIA_ROOT, 'frames', str(user.id), str(video.id)
            )
            os.makedirs(output_dir, exist_ok=True)
            
            print(f"Extracting frames from: {video_file_path}")
            print(f"Output dir: {output_dir}")
            print(f"FPS: {fps}, Format: {image_format}")
            
            # Extract frames using FFmpeg
            frame_paths = ffmpeg_extract(
                video_file_path, output_dir, fps=fps, format=image_format
            )
            
            print(f"Extracted {len(frame_paths)} frames")
            
            # Process each frame - detect blur, get metadata, save to DB
            frames_created = 0
            for i, frame_path in enumerate(frame_paths):
                try:
                    # Calculate timestamp based on frame number and fps
                    timestamp = i / fps
                    
                    # Get image info
                    img_info = get_image_info(frame_path)
                    file_size = os.path.getsize(frame_path)
                    
                    # Detect blur
                    is_blurred = False
                    blur_score = None
                    try:
                        is_blurred, blur_score = detect_blur(frame_path)
                    except Exception as blur_err:
                        print(f"Blur detection failed for frame {i}: {blur_err}")
                    
                    # Build the relative media path and URL
                    rel_path = os.path.relpath(frame_path, settings.MEDIA_ROOT)
                    image_url = f'/media/{rel_path.replace(os.sep, "/")}'
                    
                    # Create CapturedImage record
                    CapturedImage.objects.create(
                        user=user,
                        image_path=rel_path,
                        image_url=image_url,
                        source_video=video.video_name,
                        timestamp=timestamp,
                        is_blurred=is_blurred,
                        blur_score=blur_score,
                        file_size=file_size,
                        width=img_info['width'],
                        height=img_info['height'],
                    )
                    frames_created += 1
                except Exception as frame_err:
                    print(f"Error processing frame {i}: {frame_err}")
                    continue
            
            # Update video status
            video.status = 'completed'
            video.frames_extracted = frames_created
            video.save()
            print(f"Frame extraction complete: {frames_created} frames saved")
            
        except Exception as e:
            print(f"Frame extraction failed: {e}")
            import traceback
            traceback.print_exc()
            video.status = 'failed'
            video.save()


class ConfigViewSet(viewsets.ViewSet):
    """Configuration API"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get user's folder configurations"""
        configs = FolderConfig.objects.filter(user=request.user)
        data = {
            'configs': [
                {
                    'id': c.id,  # type: ignore[attr-defined]
                    'folder_name': c.folder_name,
                    'folder_path': c.folder_path,
                    'image_format': c.image_format,
                    'compression_quality': c.compression_quality,
                    'auto_blur_detection': c.auto_blur_detection,
                    'is_active': c.is_active,
                    'created_at': c.created_at.isoformat(),
                    'updated_at': c.updated_at.isoformat()
                }
                for c in configs
            ]
        }
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def create_config(self, request):
        """Create or update folder configuration"""
        try:
            config, created = FolderConfig.objects.update_or_create(
                user=request.user,
                folder_name=request.data.get('folder_name'),
                defaults={
                    'folder_path': request.data.get('folder_path', ''),
                    'image_format': request.data.get('image_format', 'png'),
                    'compression_quality': int(request.data.get('compression_quality', 85)),
                    'auto_blur_detection': request.data.get('auto_blur_detection', False),
                    'is_active': request.data.get('is_active', True)
                }
            )
            return Response({
                'id': config.id,  # type: ignore[attr-defined]
                'message': 'Configuration created' if created else 'Configuration updated',
                'config': {
                    'folder_name': config.folder_name,
                    'folder_path': config.folder_path,
                    'image_format': config.image_format,
                    'compression_quality': config.compression_quality,
                    'auto_blur_detection': config.auto_blur_detection
                }
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['delete'])
    def delete_config(self, request):
        """Delete folder configuration"""
        try:
            config_id = request.data.get('id')
            config = FolderConfig.objects.get(id=config_id, user=request.user)
            config.delete()
            return Response({'message': 'Configuration deleted'}, status=status.HTTP_204_NO_CONTENT)
        except FolderConfig.DoesNotExist:
            return Response(
                {'error': 'Configuration not found'},
                status=status.HTTP_404_NOT_FOUND
            )
