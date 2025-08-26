import os
from datetime import datetime

from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from .serializers import EcowittObservationSerializer


class EcowittIngestView(APIView):
    """
    Receives Ecowitt station payloads and stores observations.
    The endpoint is unauthenticated but validates using ECOWITT_STATION_PASSKEY.
    """

    permission_classes = [AllowAny]

    def _ingest(self, payload: dict):
        expected_passkey = os.getenv("ECOWITT_STATION_PASSKEY")
        received_passkey = payload.get("PASSKEY")

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
        data = dict(payload)
        data.pop("PASSKEY", None)

        serializer = EcowittObservationSerializer(data=data)
        if serializer.is_valid():
            observation = serializer.save()
            return Response(
                EcowittObservationSerializer(observation).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=EcowittObservationSerializer,
        responses={201: EcowittObservationSerializer},
        description="Ingest Ecowitt observation payload via POST",
    )
    def post(self, request, *args, **kwargs):
        return self._ingest(request.data)
