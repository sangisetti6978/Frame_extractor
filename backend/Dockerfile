# Use official Python runtime as a parent image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files
ENV DJANGO_SETTINGS_MODULE=video_extractor.settings
RUN python manage.py collectstatic --noinput

# Run migrations, ensure admin user, and start gunicorn
CMD python manage.py migrate && python manage.py ensure_admin && gunicorn --bind 0.0.0.0:${PORT:-8000} video_extractor.wsgi:application
