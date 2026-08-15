import django, os
os.environ['DJANGO_SETTINGS_MODULE'] = 'video_extractor.settings'
django.setup()

from video_extractor.core.models import User

# Make Bhargav admin
try:
    bhargav = User.objects.get(username='Bhargav')
    bhargav.is_staff = True
    bhargav.is_superuser = True
    bhargav.save()
    print("OK Bhargav is now an Admin")
except User.DoesNotExist:
    print("ERROR: Bhargav not found")

# Delete arey account completely
try:
    arey = User.objects.get(username='arey')
    arey.delete()
    print("OK Account 'arey' has been deleted")
except User.DoesNotExist:
    print("ERROR: arey not found")

# Print final state
print("\n--- Current Users ---")
for u in User.objects.all():
    role = "ADMIN" if u.is_superuser else "user"
    print(f"ID:{u.id} | {u.username} | {role}")
