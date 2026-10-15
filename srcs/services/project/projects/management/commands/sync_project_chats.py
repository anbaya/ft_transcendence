from django.core.management.base import BaseCommand
import requests
from projects.models import Project
from projects.chat_service import create_project_conversation


class Command(BaseCommand):
    help = "Synchronizes project conversations."

    def handle(self, *args, **options):
        projects = Project.objects.filter(
            chat_sync_status__in=['pending', 'failed']
        )

        for project in projects:
            try:
                create_project_conversation(project.id)
            except Exception as e:
                project.chat_sync_status = 'failed'
                project.save(update_fields=['chat_sync_status'])

                self.stderr.write(
                    f"Project {project.id} failed: "
                    f"{type(e).__name__} - {e} - "
                    f"{e.response.text if isinstance(e, requests.HTTPError) and e.response is not None else ''}"
                )
            else:
                project.chat_sync_status = 'ready'
                project.save(update_fields=['chat_sync_status'])

                self.stdout.write(
                    f"Conversation ready for project {project.id}"
                )