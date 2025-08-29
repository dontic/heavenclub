from rest_framework import serializers

from .models import EcowittObservation, EcowittObservation5Min


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


class EcowittObservation5MinSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcowittObservation5Min
        fields = [
            "bucket_start",
            "sample_count",
            "tempinf_avg",
            "humidityin_avg",
            "baromrelin_avg",
            "baromabsin_avg",
            "tempf_avg",
            "humidity_avg",
            "winddir_avg",
            "windspeedmph_avg",
            "windgustmph_max",
            "maxdailygust_max",
            "solarradiation_avg",
            "uv_avg",
            "rainratein_avg",
            "eventrainin_last",
            "hourlyrainin_last",
            "dailyrainin_last",
            "weeklyrainin_last",
            "monthlyrainin_last",
            "yearlyrainin_last",
            "totalrainin_last",
        ]
