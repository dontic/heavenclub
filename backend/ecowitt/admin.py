from django.contrib import admin

from .models import EcowittObservation, EcowittObservation5Min


@admin.register(EcowittObservation)
class EcowittObservationAdmin(admin.ModelAdmin):
    list_display = (
        "dateutc",
        "tempf",
        "humidity",
        "windspeedmph",
        "windgustmph",
        "rainratein",
        "solarradiation",
        "uv",
        "stationtype",
        "created_at",
    )
    list_filter = ("stationtype", "uv", "dateutc")
    search_fields = ("stationtype", "model", "freq")
    readonly_fields = ("created_at",)
    date_hierarchy = "dateutc"
    ordering = ("-dateutc", "-created_at")
    list_per_page = 50


@admin.register(EcowittObservation5Min)
class EcowittObservation5MinAdmin(admin.ModelAdmin):
    list_display = (
        "bucket_start",
        "sample_count",
        "tempf_avg",
        "humidity_avg",
        "windspeedmph_avg",
        "windgustmph_max",
        "rainratein_avg",
        "solarradiation_avg",
        "uv_avg",
        "created_at",
    )
    list_filter = ("bucket_start",)
    readonly_fields = ("created_at",)
    date_hierarchy = "bucket_start"
    ordering = ("-bucket_start", "-created_at")
    list_per_page = 50
