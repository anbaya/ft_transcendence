import os
import sys
import logging
from django.apps import AppConfig

logger = logging.getLogger(__name__)


class AssistantConfig(AppConfig):
    name = "assistant"

    def ready(self):
        # Ignore during CLI management commands
        if any(cmd in sys.argv for cmd in ["migrate", "makemigrations", "collectstatic", "check"]):
            return

        # Avoid double execution during Django auto-reload
        if "runserver" in sys.argv and os.environ.get("RUN_MAIN") != "true":
            return

        try:
            from .warmup import start_warmup_thread
            start_warmup_thread()
        except Exception as e:
            logger.warning(f"Failed to start warmup thread: {e}")
