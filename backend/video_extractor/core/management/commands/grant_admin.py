"""
Management command to grant admin/superuser status to a specific username.
Usage: python manage.py grant_admin <username>
"""
from django.core.management.base import BaseCommand
from video_extractor.core.models import User


class Command(BaseCommand):
    help = 'Grant admin/superuser privileges to a user account'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to grant admin access')

    def handle(self, *args, **options):
        username = options['username']
        try:
            user = User.objects.get(username=username)
            user.is_staff = True
            user.is_superuser = True
            user.save(update_fields=['is_staff', 'is_superuser'])
            self.stdout.write(self.style.SUCCESS(
                f"✅ Success! '{username}' (id={user.id}) is now an admin/superuser."
            ))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(
                f"❌ User '{username}' not found. Register the account first, then run this command."
            ))
