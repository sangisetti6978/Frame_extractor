"""FFmpeg utilities for frame extraction"""
import ffmpeg
import os
import shutil
import subprocess

# Try to find ffmpeg binary, with fallback to explicit path for Windows
def _get_ffmpeg_cmd():
    """Get the ffmpeg command, trying PATH first, then explicit paths"""
    # Try to find in system PATH first
    ffmpeg_cmd = shutil.which('ffmpeg')
    if ffmpeg_cmd:
        return ffmpeg_cmd
    
    # Try explicit Windows path
    windows_path = r'C:\Users\HP\scoop\apps\ffmpeg\current\bin\ffmpeg.exe'
    if os.path.exists(windows_path):
        return windows_path
    
    # Fallback to 'ffmpeg' and let subprocess try
    return 'ffmpeg'


def _get_ffprobe_cmd():
    """Get the ffprobe command, trying PATH first, then explicit paths"""
    # Try to find in system PATH first
    ffprobe_cmd = shutil.which('ffprobe')
    if ffprobe_cmd:
        return ffprobe_cmd
    
    # Try to find ffprobe next to ffmpeg
    ffmpeg_cmd = _get_ffmpeg_cmd()
    ffmpeg_dir = os.path.dirname(ffmpeg_cmd)
    ffprobe_path = os.path.join(ffmpeg_dir, 'ffprobe.exe')
    if os.path.exists(ffprobe_path):
        return ffprobe_path
    
    # Try explicit Windows path
    windows_path = r'C:\Users\HP\scoop\apps\ffmpeg\current\bin\ffprobe.exe'
    if os.path.exists(windows_path):
        return windows_path
    
    # Fallback to 'ffprobe' and let subprocess try
    return 'ffprobe'


def extract_frames(video_path, output_dir, fps=1, format='png'):
    """
    Extract frames from video using FFmpeg
    
    Args:
        video_path: Path to input video
        output_dir: Directory to save frames
        fps: Frames per second to extract
        format: Output format (png, jpg, etc)
    
    Returns:
        List of extracted frame paths
    """
    os.makedirs(output_dir, exist_ok=True)
    output_pattern = os.path.join(output_dir, f'frame_%04d.{format}')
    
    try:
        ffmpeg_cmd = _get_ffmpeg_cmd()
        stream = ffmpeg.input(video_path)
        stream = ffmpeg.filter(stream, 'fps', fps=fps)
        stream = ffmpeg.output(stream, output_pattern)
        ffmpeg.run(stream, cmd=ffmpeg_cmd, quiet=True)
        
        frames = sorted([
            os.path.join(output_dir, f) 
            for f in os.listdir(output_dir) 
            if f.endswith(format)
        ])
        return frames
    except Exception as e:
        raise Exception(f"Frame extraction failed: {str(e)}")


def get_video_info(video_path):
    """Get video metadata using FFmpeg"""
    try:
        ffprobe_cmd = _get_ffprobe_cmd()
        print(f"DEBUG: Using ffprobe cmd for probe: {ffprobe_cmd}")
        
        probe = ffmpeg.probe(video_path, cmd=ffprobe_cmd)
        print(f"DEBUG: Probe succeeded, got {len(probe['streams'])} streams")
        
        video_stream = next(
            (stream for stream in probe['streams'] if stream['codec_type'] == 'video'),
            None
        )
        
        if not video_stream:
            raise Exception("No video stream found")
        
        duration = float(probe['format']['duration'])
        width = video_stream['width']
        height = video_stream['height']
        fps = eval(video_stream['r_frame_rate'])
        
        print(f"DEBUG: Extracted metadata - Duration: {duration}s, Resolution: {width}x{height}, FPS: {fps}")
        
        return {
            'duration': duration,
            'width': width,
            'height': height,
            'fps': fps,
            'codec': video_stream['codec_name'],
        }
    except Exception as e:
        print(f"ERROR in get_video_info: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise Exception(f"Failed to get video info: {str(e)}")
