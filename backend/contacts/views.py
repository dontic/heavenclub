from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema

from .serializers import ContactSerializer
from .models import Contact
from .tasks import send_contact_notification


class ContactCreateView(APIView):
    """
    API endpoint for creating contact requests
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=ContactSerializer,
        responses={201: ContactSerializer},
        description="Create a new contact request",
    )
    def post(self, request, *args, **kwargs):
        serializer = ContactSerializer(data=request.data)

        if serializer.is_valid():
            contact = serializer.save()

            # Send notification emails
            send_contact_notification.delay(contact.id)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
