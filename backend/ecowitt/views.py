import os
from datetime import datetime

from django.utils.dateparse import parse_datetime
from django.http import QueryDict
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from .serializers import EcowittObservationSerializer
from .models import EcowittObservation

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

    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: EcowittObservationSerializer},
        description="Get the latest Ecowitt observation via GET",
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
    Returns observations between two datetimes. Authentication required.
    Query params:
      - start: ISO8601 datetime
      - end: ISO8601 datetime
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="start",
                type=OpenApiTypes.DATETIME,
                location=OpenApiParameter.QUERY,
                required=True,
                description="Start datetime (inclusive)",
            ),
            OpenApiParameter(
                name="end",
                type=OpenApiTypes.DATETIME,
                location=OpenApiParameter.QUERY,
                required=True,
                description="End datetime (inclusive)",
            ),
        ],
        responses={200: EcowittObservationSerializer(many=True)},
        description="Get observations between two datetimes via GET",
    )
    def get(self, request, *args, **kwargs):
        start_raw = request.query_params.get("start")
        end_raw = request.query_params.get("end")

        if not start_raw or not end_raw:
            return Response(
                {"detail": "Both 'start' and 'end' query parameters are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        start_dt = parse_datetime(start_raw)
        end_dt = parse_datetime(end_raw)

        if start_dt is None or end_dt is None:
            return Response(
                {"detail": "Invalid datetime format for 'start' or 'end'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if end_dt < start_dt:
            return Response(
                {"detail": "'end' must be greater than or equal to 'start'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = EcowittObservation.objects.filter(
            dateutc__gte=start_dt, dateutc__lte=end_dt
        ).order_by("dateutc", "created_at")

        serializer = EcowittObservationSerializer(queryset, many=True)
        return Response(serializer.data)
