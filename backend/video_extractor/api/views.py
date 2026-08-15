from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from video_extractor.core.models import CapturedImage, VideoUpload, FolderConfig
from video_extractor.core.serializers import CapturedImageSerializer, VideoUploadSerializer
from video_extractor.core.utils.ffmpeg_utils import get_video_info
import os
import shutil
from django.core.files.storage import default_storage
from django.conf import settings
from django.http import FileResponse, Http404
try:
    from PIL import Image
    HAS_PILLOW = True
except ImportError:
    HAS_PILLOW = False

class ImageViewSet(viewsets.ModelViewSet):
    """Captured images API"""
    serializer_class = CapturedImageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
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
            # Generate a unique filename using timestamp + resolution for easy identification
            timestamp_str = f"{timestamp:.3f}".replace('.', '_')
            res_str = f"{width}x{height}" if width and height else 'native'
            filename = f'frame_{timestamp_str}_{res_str}.png'
            file_path = default_storage.save(
                f'{frame_dir}/{filename}',
                image_file
            )
            
            full_path = os.path.join(settings.MEDIA_ROOT, file_path)

            # ── Re-save as maximum-quality lossless PNG using Pillow ──────────
            # This ensures the image is stored with the highest fidelity,
            # regardless of how the browser encoded the blob.
            if HAS_PILLOW:
                try:
                    img = Image.open(full_path)
                    # Convert to RGB if needed (removes alpha for JPEG compat)
                    if img.mode not in ('RGB', 'RGBA', 'L'):
                        img = img.convert('RGB')
                    # Save as PNG with compression_level=0 for fastest/largest
                    # but completely lossless. optimize=False to skip slow analysis.
                    img.save(
                        full_path,
                        format='PNG',
                        compress_level=0,   # 0 = no compression, max fidelity, fastest
                        optimize=False,
                    )
                    # Update width/height from actual image if not provided
                    if width == 0 or height == 0:
                        width, height = img.size
                    img.close()
                except Exception as pil_err:
                    print(f"Pillow re-save skipped: {pil_err}")

            file_size = os.path.getsize(full_path)
            
            # Run blur detection
            is_blurred = False
            blur_score = None
            try:
                from video_extractor.core.utils.opencv_utils import detect_blur
                is_blurred, blur_score = detect_blur(full_path)
            except Exception as blur_err:
                print(f"Blur detection failed: {blur_err}")
            
            # Create CapturedImage record (stored in server gallery only)
            captured = CapturedImage.objects.create(
                user=request.user,
                config=None,
                image_path=file_path,
                image_url='',
                source_video=video_name,
                timestamp=timestamp,
                is_blurred=is_blurred,
                blur_score=blur_score,
                is_exported=False,
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

    @action(detail=False, methods=['post'])
    def export_to_folder(self, request):
        """Export selected images to the user's configured PC folder"""
        try:
            image_ids = request.data.get('image_ids', [])
            if not image_ids:
                return Response(
                    {'error': 'No images selected for export'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the user's active folder config
            active_config = FolderConfig.objects.filter(user=request.user, is_active=True).first()
            if active_config and active_config.folder_path:
                folder_path = active_config.folder_path
            else:
                # Default: save to Desktop/FrameExtractor_Exports
                desktop = os.path.join(os.path.expanduser('~'), 'Desktop')
                if not os.path.isdir(desktop):
                    desktop = os.path.expanduser('~')
                folder_path = os.path.join(desktop, 'FrameExtractor_Exports')

            # Validate that the path is absolute — a relative name like "MyPhotos"
            # would be created inside the backend working directory by mistake.
            if not os.path.isabs(folder_path):
                return Response(
                    {'error': f'The configured output folder "{folder_path}" is not an absolute path. '
                              f'Please go to Setup and set a full path like "D:\\\\MyPhotos" or "C:\\\\Users\\\\You\\\\Frames".'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            os.makedirs(folder_path, exist_ok=True)
            
            images = CapturedImage.objects.filter(id__in=image_ids, user=request.user)
            exported_count = 0
            errors = []
            
            for image in images:
                try:
                    # Resolve the source path
                    src_path = image.image_path
                    if not os.path.isabs(src_path):
                        src_path = os.path.join(settings.MEDIA_ROOT, src_path)
                    
                    if not os.path.exists(src_path):
                        errors.append(f'Source file not found for image {image.id}')
                        continue
                    
                    dest_path = os.path.join(folder_path, os.path.basename(src_path))
                    shutil.copy2(src_path, dest_path)
                    
                    image.is_exported = True
                    image.save()
                    exported_count += 1
                except Exception as copy_err:
                    errors.append(f'Failed to export image {image.id}: {str(copy_err)}')
            
            return Response({
                'exported': exported_count,
                'total': len(image_ids),
                'folder_path': folder_path,
                'errors': errors,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def serve(self, request, pk=None):
        """Serve the image file from its absolute or relative path"""
        try:
            image = self.get_object()
            path = image.image_path
            if not os.path.isabs(path):
                path = os.path.join(settings.MEDIA_ROOT, path)
                
            if not os.path.exists(path):
                raise Http404("Image file not found")
                
            return FileResponse(open(path, 'rb'), content_type='image/png')
        except CapturedImage.DoesNotExist:
            raise Http404("Image not found")


class VideoViewSet(viewsets.ModelViewSet):
    """Video uploads API"""
    serializer_class = VideoUploadSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
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
            
            # Process each frame - detect blur, get metadata, save to DB (gallery only)
            frames_created = 0
            for i, frame_path in enumerate(frame_paths):
                try:
                    # Calculate timestamp based on frame number and fps
                    timestamp = i / fps
                    
                    # Get image info
                    img_info = get_image_info(frame_path)
                    
                    # Always use relative media path (gallery only, no PC export)
                    final_image_path = os.path.relpath(frame_path, settings.MEDIA_ROOT)
                    
                    file_size = os.path.getsize(os.path.join(settings.MEDIA_ROOT, final_image_path))
                    
                    # Detect blur
                    is_blurred = False
                    blur_score = None
                    try:
                        is_blurred, blur_score = detect_blur(os.path.join(settings.MEDIA_ROOT, final_image_path))
                    except Exception as blur_err:
                        print(f"Blur detection failed for frame {i}: {blur_err}")
                    
                    # Create CapturedImage record (gallery only, not exported)
                    captured = CapturedImage.objects.create(
                        user=user,
                        config=None,
                        image_path=final_image_path,
                        image_url='',
                        source_video=video.video_name,
                        timestamp=timestamp,
                        is_blurred=is_blurred,
                        blur_score=blur_score,
                        is_exported=False,
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

    @action(detail=False, methods=['get'])
    def browse_folders(self, request):
        """Browse directories on the local filesystem for folder selection.
        
        Query params:
            path: The directory to list. If empty, returns available drives (Windows) or root.
        """
        import platform
        import string

        requested_path = request.query_params.get('path', '')

        try:
            # If no path given, return root entries (drives on Windows, / on Unix)
            if not requested_path:
                if platform.system() == 'Windows':
                    drives = []
                    for letter in string.ascii_uppercase:
                        drive = f'{letter}:\\'
                        if os.path.exists(drive):
                            drives.append({
                                'name': f'{letter}:',
                                'path': drive,
                                'is_dir': True,
                            })
                    return Response({
                        'current_path': '',
                        'parent_path': None,
                        'entries': drives,
                    })
                else:
                    requested_path = '/'

            # Normalise and ensure the path exists
            requested_path = os.path.normpath(requested_path)
            if not os.path.isdir(requested_path):
                return Response(
                    {'error': f'Directory not found: {requested_path}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # List only subdirectories (skip hidden/system dirs)
            entries = []
            try:
                for entry in sorted(os.listdir(requested_path)):
                    full = os.path.join(requested_path, entry)
                    if os.path.isdir(full) and not entry.startswith('.'):
                        entries.append({
                            'name': entry,
                            'path': full,
                            'is_dir': True,
                        })
            except PermissionError:
                pass  # silently skip dirs we can't read

            parent = os.path.dirname(requested_path)
            if parent == requested_path:
                parent = None  # at root

            return Response({
                'current_path': requested_path,
                'parent_path': parent,
                'entries': entries,
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
