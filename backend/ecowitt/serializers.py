from rest_framework import serializers

from .models import EcowittObservation


class EcowittObservationSerializer(serializers.ModelSerializer):
    dateutc = serializers.DateTimeField(
        input_formats=[
            "%Y-%m-%d %H:%M:%S",
            "%Y/%m/%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S%z",
            "%Y-%m-%dT%H:%M:%S",
        ]
    )

    class Meta:
        model = EcowittObservation
        fields = [
            "stationtype",
            "runtime",
            "heap",
            "dateutc",
            "tempinf",
            "humidityin",
            "baromrelin",
            "baromabsin",
            "tempf",
            "humidity",
            "winddir",
            "windspeedmph",
            "windgustmph",
            "maxdailygust",
            "solarradiation",
            "uv",
            "rainratein",
            "eventrainin",
            "hourlyrainin",
            "dailyrainin",
            "weeklyrainin",
            "monthlyrainin",
            "yearlyrainin",
            "totalrainin",
            "wh65batt",
            "freq",
            "model",
            "interval",
        ]
