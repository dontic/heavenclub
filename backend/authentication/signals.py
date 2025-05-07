from django.contrib.sessions.models import Session
from django.contrib.auth.signals import user_logged_in
from django.utils import timezone
from django.conf import settings


def terminate_other_sessions(sender, user, request, **kwargs):
    # Skip for superusers and only terminate other sessions if SINGLE_SESSION_PER_USER setting is enabled
    if not user.is_superuser and getattr(settings, "SINGLE_SESSION_PER_USER", True):
        current_session_key = request.session.session_key
        sessions = Session.objects.filter(expire_date__gte=timezone.now())
        for session in sessions:
            data = session.get_decoded()
            if (
                data.get("_auth_user_id") == str(user.id)
                and session.session_key != current_session_key
            ):
                session.delete()


user_logged_in.connect(terminate_other_sessions)
