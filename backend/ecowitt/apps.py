from django.apps import AppConfig
import logging


log = logging.getLogger(__name__)


class EcowittConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "ecowitt"

    def ready(self):
        # Import signal handlers (safe; no DB access at import time)
        try:
            import ecowitt.signals  # noqa: F401
        except Exception as exc:  # pragma: no cover - defensive
            log.warning("Failed to load ecowitt signal handlers: %s", exc)
