import os
from typing import Iterable

from rest_framework.permissions import BasePermission


def _load_service_tokens() -> set[str]:
    """Load allowed service tokens from environment.

    Supports either ECOWITT_SERVICE_API_TOKEN (single) or
    ECOWITT_SERVICE_API_TOKENS (comma-separated list).
    """
    tokens: set[str] = set()
    single = os.getenv("ECOWITT_SERVICE_API_TOKEN", "").strip()
    if single:
        tokens.add(single)
    multiple = os.getenv("ECOWITT_SERVICE_API_TOKENS", "").strip()
    if multiple:
        tokens.update(t.strip() for t in multiple.split(",") if t.strip())
    return tokens


def _extract_token_from_headers(
    authorization_header: str | None, x_api_key: str | None
) -> str | None:
    """Extract a token from Authorization or X-API-Key headers.

    Accepts formats:
    - Authorization: Bearer <token>
    - Authorization: Token <token>
    - Authorization: <token>
    - X-API-Key: <token>
    """
    if x_api_key:
        value = x_api_key.strip()
        if value:
            return value

    if not authorization_header:
        return None

    auth_value = authorization_header.strip()
    if not auth_value:
        return None

    parts = auth_value.split()
    if len(parts) == 1:
        return parts[0]
    if len(parts) >= 2 and parts[0].lower() in {"bearer", "token"}:
        return parts[1]
    # Fallback: last part
    return parts[-1]


class IsAuthenticatedOrHasServiceToken(BasePermission):
    """Allow if the user is authenticated or presents a valid service token."""

    def has_permission(self, request, view) -> bool:
        # Allow any authenticated user via standard auth
        user = getattr(request, "user", None)
        if user is not None and user.is_authenticated:
            return True

        # Otherwise, verify service token header
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        x_api_key = request.META.get("HTTP_X_API_KEY")

        token = _extract_token_from_headers(auth_header, x_api_key)
        if not token:
            return False

        allowed_tokens = _load_service_tokens()
        return token in allowed_tokens
