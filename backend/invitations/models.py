from django.db import models
from django.utils import timezone
from django.conf import settings


class Invitation(models.Model):
    """
    Invitation model for tracking user invitations.
    Only accessible to owner and admin users.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="invitation",
    )
    invitation_accepted = models.BooleanField(default=False)
    invitation_accepted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Invitation for {self.user.email}"

    def accept_invitation(self):
        """Accept the invitation and update relevant fields."""
        self.invitation_accepted = True
        self.invitation_accepted_at = timezone.now()
        self.save()
