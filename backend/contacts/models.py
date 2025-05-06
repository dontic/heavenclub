from django.db import models
from django.utils.translation import gettext_lazy as _


class Contact(models.Model):
    """
    Model for storing contact requests from website
    """

    name = models.CharField(_("Name"), max_length=255)
    email = models.EmailField(_("Email"))
    phone = models.CharField(_("Phone"), max_length=50, blank=True)
    message = models.TextField(_("Message"))
    created_at = models.DateTimeField(_("Created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated at"), auto_now=True)

    class Meta:
        verbose_name = _("Contact")
        verbose_name_plural = _("Contacts")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.email})"
