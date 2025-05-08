from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data with invitation-like behavior"""

    class Meta:
        model = User
        fields = [
            "email",
            "last_accessed",
            "date_joined",
            "is_active",
        ]
        read_only_fields = [
            "last_accessed",
            "date_joined",
            "is_active",
        ]


class UserCreateSerializer(serializers.Serializer):
    """Serializer for creating users (replacing invitation creation)"""

    email = serializers.EmailField()
    send_email = serializers.BooleanField(default=True)

    def validate_email(self, value):
        """Validate that the email is not already registered"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This user already exists.")
        return value


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for listing users"""

    created_at = serializers.DateTimeField(source="date_joined", read_only=True)

    class Meta:
        model = User
        fields = ["email", "last_accessed", "created_at"]
        read_only_fields = ["email", "last_accessed", "created_at"]
