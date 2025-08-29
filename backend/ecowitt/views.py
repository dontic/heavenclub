import os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from django.utils.dateparse import parse_datetime
from django.http import QueryDict
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from .serializers import (
    EcowittObservationSerializer,
    EcowittObservation5MinSerializer,
)
from .permissions import IsAuthenticatedOrHasServiceToken
from .models import EcowittObservation, EcowittObservation5Min

import logging

log = logging.getLogger(__name__)


class EcowittIngestView(APIView):
    """
    Receives Ecowitt station payloads and stores observations.
    The endpoint is unauthenticated but validates using ECOWITT_STATION_PASSKEY.
    """

    permission_classes = [AllowAny]

    def _ingest(self, payload: dict):
        expected_passkey = os.getenv("ECOWITT_STATION_PASSKEY")
        # DRF can give us a QueryDict for form-encoded submissions; flatten it
        if isinstance(payload, QueryDict):
            received_passkey = payload.get("PASSKEY")
            data = payload.dict()
        else:
            received_passkey = payload.get("PASSKEY")
            # If values are lists (e.g., from dict(QueryDict)), take the first item
            data = {k: (v[0] if isinstance(v, list) else v) for k, v in payload.items()}
        log.debug(f"Payload (flattened): {data}")

        if not expected_passkey:
            return Response(
                {"detail": "ECOWITT_STATION_PASSKEY not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if received_passkey != expected_passkey:
            return Response(
                {"detail": "Invalid passkey"}, status=status.HTTP_403_FORBIDDEN
            )

        # Remove PASSKEY from validated data; it's not stored
        data.pop("PASSKEY", None)

        serializer = EcowittObservationSerializer(data=data)
        if serializer.is_valid():
            observation = serializer.save()
            return Response(
                EcowittObservationSerializer(observation).data,
                status=status.HTTP_201_CREATED,
            )

        log.error(f"Invalid payload: {serializer.errors}")

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=EcowittObservationSerializer,
        responses={201: EcowittObservationSerializer},
        description="Ingest Ecowitt observation payload via POST",
    )
    def post(self, request, *args, **kwargs):
        return self._ingest(request.data)


class EcowittRealtimeView(APIView):
    """
    Returns the latest Ecowitt observation. Authentication required.
    """

    permission_classes = [IsAuthenticatedOrHasServiceToken]

    @extend_schema(
        responses={200: EcowittObservationSerializer},
        description="Get the latest Ecowitt observation via GET",
        parameters=[
            OpenApiParameter(
                name="Authorization",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.HEADER,
                required=False,
                description=(
                    "Optional service token. Use 'Bearer <token>' or 'Token <token>'. "
                    "Alternatively provide 'X-API-Key' header."
                ),
            ),
            OpenApiParameter(
                name="X-API-Key",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.HEADER,
                required=False,
                description="Optional service token for inter-service access.",
            ),
        ],
    )
    def get(self, request, *args, **kwargs):
        observation = EcowittObservation.objects.order_by(
            "-dateutc", "-created_at"
        ).first()
        if not observation:
            return Response(
                {"detail": "No observations available"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(EcowittObservationSerializer(observation).data)


class EcowittHistoryView(APIView):
    """
    Returns aggregated 5-minute observations for a given date in Madrid timezone.
    Query params:
      - date: YYYY-MM-DD (interpreted in Europe/Madrid; 00:00 to next day 00:00)
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="date",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=True,
                description=(
                    "Date in format YYYY-MM-DD. Interpreted in Europe/Madrid; "
                    "returns 5-minute aggregates from 00:00 to 23:59 for that local day."
                ),
            ),
        ],
        responses={200: EcowittObservation5MinSerializer(many=True)},
        description=(
            "Get aggregated 5-minute observations for a given date in Madrid timezone"
        ),
    )
    def get(self, request, *args, **kwargs):
        date_raw = request.query_params.get("date")

        if not date_raw:
            return Response(
                {"detail": "'date' query parameter is required (YYYY-MM-DD)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Parse YYYY-MM-DD
            target_date = datetime.strptime(date_raw, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        madrid_tz = ZoneInfo("Europe/Madrid")
        start_local = datetime(
            target_date.year,
            target_date.month,
            target_date.day,
            0,
            0,
            0,
            tzinfo=madrid_tz,
        )
        next_day_local = start_local + timedelta(days=1)

        # Convert local window to UTC for querying stored UTC bucket_start
        from django.utils import timezone as dj_timezone

        start_utc = start_local.astimezone(dj_timezone.utc)
        next_day_utc = next_day_local.astimezone(dj_timezone.utc)

        queryset = EcowittObservation5Min.objects.filter(
            bucket_start__gte=start_utc, bucket_start__lt=next_day_utc
        ).order_by("bucket_start", "created_at")

        serializer = EcowittObservation5MinSerializer(queryset, many=True)
        return Response(serializer.data)
