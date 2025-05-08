from django.utils import timezone
import re


class LastAccessedMiddleware:
    """
    Middleware to update the last_accessed field for users when they successfully
    authenticate through the allauth session endpoint.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        # Compile the regex pattern for the allauth session endpoint
        self.session_url_pattern = re.compile(r"^/_allauth/[^/]+/v1/auth/session/?$")

    def __call__(self, request):
        response = self.get_response(request)

        # Check if this is a successful request to the allauth session endpoint
        if (
            self.session_url_pattern.match(request.path)
            and request.user.is_authenticated
            and response.status_code == 200
        ):
            # Update the last_accessed timestamp
            request.user.last_accessed = timezone.now()
            request.user.save(update_fields=["last_accessed"])

        return response
