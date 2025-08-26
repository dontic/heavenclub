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
