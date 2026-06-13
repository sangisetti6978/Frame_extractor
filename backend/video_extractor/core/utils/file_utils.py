"""File utilities"""
import os
from pathlib import Path


def ensure_dir(directory):
    """Create directory if it doesn't exist"""
    Path(directory).mkdir(parents=True, exist_ok=True)


def get_file_size(file_path):
    """Get file size in bytes"""
    try:
        return os.path.getsize(file_path)
    except Exception as e:
        raise Exception(f"Failed to get file size: {str(e)}")


def move_file(src, dst):
    """Move file from src to dst"""
    try:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        os.replace(src, dst)
    except Exception as e:
        raise Exception(f"Failed to move file: {str(e)}")


def delete_file(file_path):
    """Delete file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        raise Exception(f"Failed to delete file: {str(e)}")


def clean_directory(directory, file_extension=None):
    """Delete all files in directory, optionally filtered by extension"""
    try:
        for filename in os.listdir(directory):
            if file_extension and not filename.endswith(file_extension):
                continue
            file_path = os.path.join(directory, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
    except Exception as e:
        raise Exception(f"Failed to clean directory: {str(e)}")
