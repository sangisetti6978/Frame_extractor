from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import os

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

SYSTEM_PROMPT = """You are the official AI Assistant for FrameExtractor Studio. You must answer questions concisely, professionally, and accurately based ONLY on the following context.

About FrameExtractor Studio:
FrameExtractor Studio is a modern web application designed for creators, editors, and developers to easily extract high-quality frames from video files. It uses advanced AI-driven blur detection and scene analysis to pick the best frames.

Key Features & Workflows:
1. Uploading Videos: Users upload videos in the Workspace page. The system supports MP4, WEBM, OGG, etc. During upload, metadata like duration and resolution are extracted.
2. Extraction Methods:
   - Interval Mode: Extracts a frame every X seconds (e.g., every 5 seconds). The user controls this via a slider in the Extraction Settings.
   - AI Scene Detection: (Future feature/Coming Soon) Analyzes the video to extract frames only when the scene changes significantly.
3. Settings:
   - Format: JPG, PNG, WEBP.
   - Remove Duplicate Frames: Filters out visually identical scenes.
   - Smart Selection: Prioritizes clear frames and skips blurry ones.
4. Gallery & Storage:
   - After extraction, frames appear in the Gallery page.
   - The Gallery shows "Clarity" and "Blur" percentage bars for each image based on a Laplacian variance blur score.
   - Users can select frames and click "Save to PC".
5. Exporting (Save to PC):
   - By default, frames are exported to the user's Desktop in a "FrameExtractor_Exports" folder.
   - Users can change this output folder path by going to the "Setup" page and setting a custom absolute path (e.g., D:\\MyPhotos).

Troubleshooting & Tips:
- "Where are my photos saved?": Tell them they are saved to Desktop/FrameExtractor_Exports by default, but they can configure a custom folder in the Setup page.
- "Why did the extraction fail?": Usually due to an unsupported video format or the server lacking FFmpeg (though the system comes with FFmpeg built-in).

Constraints:
- You are answering directly to the user of the website in a chat interface.
- Keep answers under 3 paragraphs. Use bullet points for steps.
- If asked something completely unrelated to video editing, frame extraction, or the website, politely decline and say you can only help with FrameExtractor Studio.
"""

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ask_ai(request):
    """Handle AI Chat requests."""
    question = request.data.get('question', '').strip()
    
    if not question:
        return Response({'error': 'Question is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if not HAS_GEMINI:
        return Response({'error': 'AI dependencies not installed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return Response({
            'answer': "I'm sorry, my AI capabilities are currently disabled because the admin has not configured a Gemini API Key. Please contact support or add an API key in the backend settings."
        })

    try:
        genai.configure(api_key=api_key)
        
        # Use an available modern flash model for chat responses
        model = genai.GenerativeModel('gemini-3.5-flash')
        
        # Optionally, you could pass history here if the frontend sends it, 
        # but for now we'll do single-turn Q&A.
        full_prompt = f"{SYSTEM_PROMPT}\n\nUser Question: {question}"
        response = model.generate_content(full_prompt)
        
        return Response({'answer': response.text})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': f"AI Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# Trigger reload
