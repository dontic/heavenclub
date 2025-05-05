from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners or admins to access the view.
    """

    def has_permission(self, request, view):
        # Check if the user is authenticated
        if not request.user.is_authenticated:
            return False

        # Check if the user is an owner or admin
        return request.user.role in ["OWNER", "ADMIN"]
