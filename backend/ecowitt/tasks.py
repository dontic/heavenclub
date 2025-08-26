import logging
import os
from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from .models import EcowittObservation


log = logging.getLogger(__name__)


def _get_retention_days() -> int:
    raw_value = os.getenv("ECOWITT_RETENTION_DAYS", "")
    if not raw_value:
        # Default to 30 days if not provided
        return 30
    try:
        value = int(raw_value)
        # Guard against negative or zero values
        return max(value, 1)
    except ValueError:
        # Fallback to sane default and warn
        log.warning(
            "Invalid ECOWITT_RETENTION_DAYS='%s'. Falling back to 30.", raw_value
        )
        return 30


@shared_task
def purge_old_observations() -> int:
    """
    Delete Ecowitt observations older than ECOWITT_RETENTION_DAYS.

    Returns the number of deleted rows.
    """
    retention_days = _get_retention_days()
    threshold = timezone.now() - timedelta(days=retention_days)

    # Use dateutc as the primary temporal field; fall back to created_at if needed
    deleted_count, _ = EcowittObservation.objects.filter(dateutc__lt=threshold).delete()

    if deleted_count == 0:
        # As a safety net, also attempt via created_at for any edge cases
        alt_deleted_count, _ = EcowittObservation.objects.filter(
            created_at__lt=threshold
        ).delete()
        deleted_count += alt_deleted_count

    log.info(
        "Purged %s Ecowitt observations older than %s days (threshold=%s)",
        deleted_count,
        retention_days,
        threshold.isoformat(),
    )

    return deleted_count
