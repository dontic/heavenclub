from django.apps import AppConfig
import logging


log = logging.getLogger(__name__)


class EcowittConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "ecowitt"

    def ready(self):
        # Auto-create a daily beat schedule for the purge task if not present
        try:
            from django_celery_beat.models import PeriodicTask, CrontabSchedule
            from django.db.utils import OperationalError, ProgrammingError
            from django.conf import settings

            # Avoid during initial migrate when tables may not exist
            try:
                schedule, _ = CrontabSchedule.objects.get_or_create(
                    minute="0",
                    hour="3",
                    day_of_week="*",
                    day_of_month="*",
                    month_of_year="*",
                )
            except (OperationalError, ProgrammingError):
                return

            task_name = "ecowitt.tasks.purge_old_observations"
            PeriodicTask.objects.get_or_create(
                crontab=schedule,
                name="Purge old Ecowitt observations daily",
                task=task_name,
                defaults={"enabled": True},
            )
        except Exception as exc:  # pragma: no cover - defensive
            # Do not crash app startup for scheduling errors
            log.warning("Failed to ensure purge task schedule: %s", exc)
