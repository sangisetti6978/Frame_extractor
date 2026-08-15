from django.core.management.base import BaseCommand
from video_extractor.core.models import User

class Command(BaseCommand):
    help = 'Ensures the specific admin user exists for the live deployment'

    def handle(self, *args, **options):
        email = "bhargavsangisetti@gmail.com"
        username = "Bhargav"
        password = "Bhargav@9182"
        
        try:
            user = User.objects.get(username=username)
            user.email = email
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Admin user {username} updated successfully.'))
        except User.DoesNotExist:
            user = User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Admin user {username} created successfully.'))
