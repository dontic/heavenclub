import logging

from django.db.models.signals import post_migrate
from django.dispatch import receiver


log = logging.getLogger(__name__)


@receiver(post_migrate)
def create_ecowitt_purge_schedule(sender, app_config=None, **kwargs):
    """Ensure a daily celery beat schedule exists after migrations.

    Runs only for the `ecowitt` app to avoid repeated work on other apps.
    """
    try:
        # Narrow execution to our own app's post_migrate signal
        if app_config is None or app_config.name != "ecowitt":
            return

        try:
            from django_celery_beat.models import PeriodicTask, CrontabSchedule
        except Exception as exc:  # pragma: no cover - defensive
            # django_celery_beat might not be installed/migrated yet
            log.warning(
                "Celery beat models unavailable; skipping schedule creation: %s", exc
            )
            return

        schedule, _ = CrontabSchedule.objects.get_or_create(
            minute="0",
            hour="3",
            day_of_week="*",
            day_of_month="*",
            month_of_year="*",
        )

        task_name = "ecowitt.tasks.purge_old_observations"
        PeriodicTask.objects.get_or_create(
            crontab=schedule,
            name="Purge old Ecowitt observations daily",
            task=task_name,
            defaults={"enabled": True},
        )

        # Ensure 2-minute aggregation schedule exists
        from django_celery_beat.models import IntervalSchedule

        interval, _ = IntervalSchedule.objects.get_or_create(
            every=2, period=IntervalSchedule.MINUTES
        )
        agg_task_name = "ecowitt.tasks.aggregate_observations_5min"
        PeriodicTask.objects.get_or_create(
            interval=interval,
            name="Aggregate Ecowitt observations into 5-minute buckets (every 2m)",
            task=agg_task_name,
            defaults={"enabled": True},
        )
    except Exception as exc:  # pragma: no cover - defensive
        # Do not crash migrations for scheduling errors
        log.warning("Failed to ensure purge task schedule post-migrate: %s", exc)
