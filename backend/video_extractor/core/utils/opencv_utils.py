"""OpenCV utilities for blur detection"""
import cv2
import numpy as np


def detect_blur(image_path, threshold=100):
    """
    Detect blur in image using Laplacian variance
    
    Args:
        image_path: Path to image
        threshold: Blur threshold (lower = more blurred)
    
    Returns:
        (is_blurred, blur_score)
    """
    try:
        image = cv2.imread(image_path)
        if image is None:
            raise Exception("Could not read image")
        
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        is_blurred = laplacian_var < threshold
        blur_score = float(laplacian_var) / 1000  # Normalize to 0-1 scale
        
        return is_blurred, min(blur_score, 1.0)
    except Exception as e:
        raise Exception(f"Blur detection failed: {str(e)}")


def resize_image(input_path, output_path, width=500):
    """Resize image maintaining aspect ratio"""
    try:
        image = cv2.imread(input_path)
        if image is None:
            raise Exception("Could not read image")
        
        height = int(image.shape[0] * (width / image.shape[1]))
        resized = cv2.resize(image, (width, height))
        cv2.imwrite(output_path, resized)
    except Exception as e:
        raise Exception(f"Image resize failed: {str(e)}")


def get_image_info(image_path):
    """Get image dimensions"""
    try:
        image = cv2.imread(image_path)
        if image is None:
            raise Exception("Could not read image")
        
        return {
            'width': image.shape[1],
            'height': image.shape[0],
        }
    except Exception as e:
        raise Exception(f"Failed to get image info: {str(e)}")
