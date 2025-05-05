from django.shortcuts import render
from rest_framework import generics, status, mixins, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings
from django.db import transaction
from allauth.account.utils import user_email, user_pk_to_url_str
from allauth.account.utils import user_username
from allauth.account.models import EmailAddress
from allauth.account.adapter import get_adapter

from utils.loops import send_transactional_email_task
from .models import Invitation
from .serializers import InvitationSerializer, InvitationCreateSerializer
from .permissions import IsOwnerOrAdmin

User = get_user_model()


class InvitationViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for managing invitations
    - Create: Create a new invitation
    - Destroy: Delete an invitation
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

        # Check if the user already exists
        user_exists = User.objects.filter(email=email).exists()
        if user_exists:
            user = User.objects.get(email=email)
            if hasattr(user, "invitation"):
                return Response(
                    {"error": "This user already has an invitation."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        with transaction.atomic():
            # Create a new user using allauth pattern if doesn't exist
            if not user_exists:
                # Create a user with an unusable password
                user = User.objects.create(email=email, is_active=True, role="USER")
                user.set_unusable_password()
                user.save()

                # Create verified email record
                EmailAddress.objects.create(
                    user=user, email=email, primary=True, verified=False
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

                # Generate verification key if needed
                email_address = EmailAddress.objects.get(user=user, email=email)
                if not email_address.verified:
                    email_address.send_confirmation(request)

                # Prepare data for the invitation email
                data_variables = {
                    "user_email": email,
                    "invitation_link": f"{settings.FRONTEND_BASE_URL}/accept-invitation/{user.id}",
                }

                # Send the invitation email using Loops
                send_transactional_email_task.delay(
                    transaction_id, email, data_variables
                )

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
