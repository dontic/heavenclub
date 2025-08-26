from django.urls import path

from .views import EcowittIngestView, EcowittRealtimeView, EcowittHistoryView


urlpatterns = [
    path("", EcowittIngestView.as_view(), name="ecowitt-ingest"),
    path("realtime", EcowittRealtimeView.as_view(), name="ecowitt-realtime"),
    path("history", EcowittHistoryView.as_view(), name="ecowitt-history"),
]
