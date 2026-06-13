FROM python:3.10-slim

# Install system dependencies including ffmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
# Replace opencv-python with opencv-python-headless to avoid X11 dependencies
RUN sed -i 's/opencv-python==/opencv-python-headless==/' requirements.txt
# Add gunicorn to requirements
RUN echo "gunicorn==21.2.0" >> requirements.txt
# Add whitenoise for static files
RUN echo "whitenoise==6.6.0" >> requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files
ENV DJANGO_SETTINGS_MODULE=video_extractor.settings
RUN python manage.py collectstatic --noinput

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "video_extractor.wsgi:application"]
