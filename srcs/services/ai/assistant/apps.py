import os
import sys
import logging
from django.apps import AppConfig

logger = logging.getLogger(__name__)


class AssistantConfig(AppConfig):
    name = "assistant"

    def ready(self):
        if any(cmd in sys.argv for cmd in ["migrate", "makemigrations", "collectstatic", "check"]):
            return

        if "runserver" in sys.argv and os.environ.get("RUN_MAIN") != "true":
            return

        try:
            from .warmup import start_warmup_thread
            start_warmup_thread()
        except Exception as e:
            logger.warning(f"Failed to start warmup thread: {e}")
