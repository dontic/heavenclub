from django.db import models


class EcowittObservation(models.Model):
    """
    Stores a single observation payload sent by an Ecowitt weather station.

    The station's PASSKEY is validated at the API layer and is NOT stored here.
    """

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)

    # Station/system information
    stationtype = models.CharField(max_length=64)
    runtime = models.BigIntegerField()
    heap = models.BigIntegerField()
    dateutc = models.DateTimeField()

    # Indoor measurements
    tempinf = models.FloatField()
    humidityin = models.IntegerField()
    baromrelin = models.FloatField()
    baromabsin = models.FloatField()

    # Outdoor measurements
    tempf = models.FloatField()
    humidity = models.IntegerField()
    winddir = models.IntegerField()
    windspeedmph = models.FloatField()
    windgustmph = models.FloatField()
    maxdailygust = models.FloatField()
    solarradiation = models.FloatField()
    uv = models.IntegerField()

    # Rainfall
    rainratein = models.FloatField()
    eventrainin = models.FloatField()
    hourlyrainin = models.FloatField()
    dailyrainin = models.FloatField()
    weeklyrainin = models.FloatField()
    monthlyrainin = models.FloatField()
    yearlyrainin = models.FloatField()
    totalrainin = models.FloatField()

    # Misc
    wh65batt = models.CharField(max_length=16)
    freq = models.CharField(max_length=16)
    model = models.CharField(max_length=64)
    interval = models.IntegerField()

    class Meta:
        ordering = ["-dateutc", "-created_at"]

    def __str__(self) -> str:  # pragma: no cover - readability only
        return f"EcowittObservation at {self.dateutc.isoformat()}"


class EcowittObservation5Min(models.Model):
    """
    Aggregated 5-minute buckets derived from `EcowittObservation`.

    Buckets are aligned to wall-clock boundaries, e.g., 00:00, 00:05, 00:10, ...
    The bucket spans [bucket_start, bucket_start + 5 minutes).
    """

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)

    # Temporal bucket
    bucket_start = models.DateTimeField(unique=True)
    sample_count = models.IntegerField(default=0)

    # Indoor measurements (averages)
    tempinf_avg = models.FloatField()
    humidityin_avg = models.FloatField()
    baromrelin_avg = models.FloatField()
    baromabsin_avg = models.FloatField()

    # Outdoor measurements (averages unless otherwise stated)
    tempf_avg = models.FloatField()
    humidity_avg = models.FloatField()
    winddir_avg = models.FloatField()
    windspeedmph_avg = models.FloatField()
    windgustmph_max = models.FloatField()
    maxdailygust_max = models.FloatField()
    solarradiation_avg = models.FloatField()
    uv_avg = models.FloatField()

    # Rainfall (rate averaged; cumulative values use last observed in bucket)
    rainratein_avg = models.FloatField()
    eventrainin_last = models.FloatField()
    hourlyrainin_last = models.FloatField()
    dailyrainin_last = models.FloatField()
    weeklyrainin_last = models.FloatField()
    monthlyrainin_last = models.FloatField()
    yearlyrainin_last = models.FloatField()
    totalrainin_last = models.FloatField()

    class Meta:
        ordering = ["-bucket_start", "-created_at"]

    def __str__(self) -> str:  # pragma: no cover - readability only
        return f"EcowittObservation5Min bucket @ {self.bucket_start.isoformat()} ({self.sample_count} samples)"
