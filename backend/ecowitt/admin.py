from django.contrib import admin

from .models import EcowittObservation


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
