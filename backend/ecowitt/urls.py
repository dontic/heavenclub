from django.urls import path

from .views import EcowittIngestView


urlpatterns = [
    path("", EcowittIngestView.as_view(), name="ecowitt-ingest"),
]
