from django.urls import path

from .views import EcowittIngestView, EcowittRealtimeView


urlpatterns = [
    path("", EcowittIngestView.as_view(), name="ecowitt-ingest"),
    path("realtime", EcowittRealtimeView.as_view(), name="ecowitt-realtime"),
]
