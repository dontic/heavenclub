import logging
import os
from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from .models import EcowittObservation, EcowittObservation5Min


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


def _floor_to_5_minutes(dt):
    # dt assumed timezone-aware (UTC). Floors to nearest 5-minute boundary.
    minute = (dt.minute // 5) * 5
    return dt.replace(minute=minute, second=0, microsecond=0)


@shared_task
def aggregate_observations_5min() -> int:
    """
    Aggregate raw observations into 5-minute buckets aligned at :00, :05, :10, ...

    Strategy:
    - Determine the most recent completed bucket end (now floored to 5m).
    - Find the last aggregated bucket_start; aggregate any missing buckets up to latest completed.
    - For each bucket, compute averages and maxima, and upsert into EcowittObservation5Min.

    Returns number of buckets aggregated.
    """
    now = timezone.now()
    latest_completed_end = _floor_to_5_minutes(now)

    # Identify where to start based on last aggregated bucket
    last_agg = EcowittObservation5Min.objects.order_by("-bucket_start").first()
    if last_agg is not None:
        start_time = last_agg.bucket_start + timedelta(minutes=5)
    else:
        # If no aggregations exist, start from the earliest observation floored
        first_obs = EcowittObservation.objects.order_by("dateutc", "created_at").first()
        if first_obs is None:
            return 0
        start_time = _floor_to_5_minutes(first_obs.dateutc)

    if start_time >= latest_completed_end:
        return 0

    aggregated = 0
    bucket_start = start_time
    while bucket_start < latest_completed_end:
        bucket_end = bucket_start + timedelta(minutes=5)
        qs = EcowittObservation.objects.filter(
            dateutc__gte=bucket_start, dateutc__lt=bucket_end
        )
        # Skip empty buckets
        if not qs.exists():
            bucket_start = bucket_end
            continue

        # Compute aggregates
        from django.db.models import Avg, Max

        stats = qs.aggregate(
            tempinf_avg=Avg("tempinf"),
            humidityin_avg=Avg("humidityin"),
            baromrelin_avg=Avg("baromrelin"),
            baromabsin_avg=Avg("baromabsin"),
            tempf_avg=Avg("tempf"),
            humidity_avg=Avg("humidity"),
            winddir_avg=Avg("winddir"),
            windspeedmph_avg=Avg("windspeedmph"),
            windgustmph_max=Max("windgustmph"),
            maxdailygust_max=Max("maxdailygust"),
            solarradiation_avg=Avg("solarradiation"),
            uv_avg=Avg("uv"),
            rainratein_avg=Avg("rainratein"),
        )

        # For cumulative-like fields, take the last value within the bucket by dateutc/created_at
        last = qs.order_by("-dateutc", "-created_at").first()

        obj, _ = EcowittObservation5Min.objects.update_or_create(
            bucket_start=bucket_start,
            defaults={
                "sample_count": qs.count(),
                **stats,
                "eventrainin_last": last.eventrainin,
                "hourlyrainin_last": last.hourlyrainin,
                "dailyrainin_last": last.dailyrainin,
                "weeklyrainin_last": last.weeklyrainin,
                "monthlyrainin_last": last.monthlyrainin,
                "yearlyrainin_last": last.yearlyrainin,
                "totalrainin_last": last.totalrainin,
            },
        )

        aggregated += 1
        bucket_start = bucket_end

    log.info(
        "Aggregated %s five-minute buckets up to %s", aggregated, latest_completed_end
    )
    return aggregated
