from django.shortcuts import render
from rest_framework import status, mixins, viewsets
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings
from django.db import transaction
from allauth.account.models import EmailAddress

from utils.loops import send_transactional_email_task
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserListSerializer,
)
from .permissions import IsOwnerOrAdmin

User = get_user_model()


class UserViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for managing users
    - Create: Create a new user
    - Destroy: Delete a user
    - List: List all users
    """

    permission_classes = [IsOwnerOrAdmin]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        elif self.action == "list":
            return UserListSerializer
        return UserSerializer

    def list(self, request, *args, **kwargs):
        """List all users with their information"""
        queryset = User.objects.all().order_by("-date_joined")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Create a new user"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        send_email = serializer.validated_data["send_email"]

        with transaction.atomic():
            # Create a new user using allauth pattern
            # Create a user with an unusable password
            user = User.objects.create(email=email, is_active=True, role="USER")
            user.set_unusable_password()
            user.save()

            # Create verified email record
            EmailAddress.objects.create(
                user=user, email=email, primary=True, verified=False
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

        # Return the created user
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """Delete user"""
        user = self.get_object()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_object(self):
        """Get user object based on lookup field"""
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]

        # If lookup is by ID
        if lookup_value.isdigit():
            filter_kwargs = {"id": lookup_value}
        else:
            # Otherwise assume it's an email
            filter_kwargs = {"email": lookup_value}

        obj = User.objects.get(**filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj
