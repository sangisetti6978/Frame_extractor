from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'images', views.ImageViewSet, basename='image')
router.register(r'videos', views.VideoViewSet, basename='video')
router.register(r'config', views.ConfigViewSet, basename='config')

urlpatterns = [
    path('', include(router.urls)),
]
