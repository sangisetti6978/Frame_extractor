"""
ASGI config for video_extractor project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'video_extractor.settings')

application = get_asgi_application()
