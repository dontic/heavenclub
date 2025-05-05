from django.shortcuts import render
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings

from utils.loops import send_transactional_email_task
from .models import Invitation
from .serializers import InvitationSerializer, InvitationCreateSerializer
from .permissions import IsOwnerOrAdmin

User = get_user_model()


class InvitationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing invitations
    """

    permission_classes = [IsOwnerOrAdmin]
    serializer_class = InvitationSerializer
    queryset = Invitation.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return InvitationCreateSerializer
        return InvitationSerializer

    def create(self, request, *args, **kwargs):
        """Create a new invitation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        send_email = serializer.validated_data["send_email"]

        # Create a new user with the email if it doesn't exist
        user, created = User.objects.get_or_create(
            email=email, defaults={"is_active": True, "role": "USER"}
        )

        # Create invitation for the user
        invitation, created = Invitation.objects.get_or_create(
            user=user,
            defaults={"invitation_accepted": False, "created_at": timezone.now()},
        )

        # Send invitation email if requested
        if send_email:
            # Using a placeholder transactional email ID
            transaction_id = "placeholder_invitation_email_id"

            # Prepare data for the email
            data_variables = {
                "user_email": email,
                "invitation_link": f"{settings.FRONTEND_URL}/accept-invitation/{user.id}",
            }

            # Send the email using Loops
            send_transactional_email_task.delay(transaction_id, email, data_variables)

        # Return the created invitation
        return Response(
            InvitationSerializer(invitation).data, status=status.HTTP_201_CREATED
        )

    def destroy(self, request, *args, **kwargs):
        """Delete invitation and associated user"""
        invitation = self.get_object()
        user = invitation.user

        # Delete the invitation first (which is actually just deleting the user)
        user.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
