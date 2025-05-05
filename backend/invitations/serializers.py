from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Invitation

User = get_user_model()


class InvitationSerializer(serializers.ModelSerializer):
    """Serializer for the Invitation model"""

    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Invitation
        fields = [
            "email",
            "invitation_accepted",
            "invitation_accepted_at",
            "created_at",
        ]
        read_only_fields = [
            "invitation_accepted",
            "invitation_accepted_at",
            "created_at",
        ]


class InvitationCreateSerializer(serializers.Serializer):
    """Serializer for creating invitations"""

    email = serializers.EmailField()
    send_email = serializers.BooleanField(default=True)

    def validate_email(self, value):
        """Validate that the email is not already registered"""
        if User.objects.filter(email=value).exists():
            user = User.objects.get(email=value)
            if hasattr(user, "invitation"):
                raise serializers.ValidationError(
                    "This user already has an invitation."
                )
        return value
