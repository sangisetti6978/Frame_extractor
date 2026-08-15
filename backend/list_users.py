from video_extractor.core.models import User
users = User.objects.all().values('id','username','email','is_staff','is_superuser')
for u in users:
    print(f"ID:{u['id']} | {u['username']} | {u['email']} | admin:{u['is_superuser']}")
