"""
singnals.py

This file contains the signals for the authentication app.
"""

from django.dispatch import receiver
from allauth.account.signals import user_signed_up, email_confirmed
from utils.loops import update_or_create_contact_task
from tenants.models import TenantUser

import logging

log = logging.getLogger(__name__)


# Create a contact in Loops when a new user signs up
@receiver(user_signed_up)
def create_contact_on_signup(sender, request, user, **kwargs):
    """
    Create a contact in Loops when a new user signs up
    """
    log.info(f"Creating contact for {user.email}")
    log.debug(f"Request: {request}")

    # Get the tenant from the request
    tenant = TenantUser.objects.get(user=user).tenant

    update_or_create_contact_task.delay(
        email=user.email,
        firstName=user.first_name,
        lastName=user.last_name,
        source="app",
        subscribed=True,
        userGroup="sign_up_not_verified",
        userId=user.id,
        mailingList={},
        tenantId=tenant.pk,
    )


# Create a signal to update a contact if the user's email is confirmed
@receiver(email_confirmed)
def create_audience_member_on_email_confirmation(
    sender, request, email_address, **kwargs
):
    """
    Create an audience member in Loops when a user verifies their email
    """
    log.info(f"Creating audience member for {email_address}")
    log.debug(f"Request: {request}")

    # Get the tenant for the user
    tenant = TenantUser.objects.get(user=email_address.user).tenant

    update_or_create_contact_task.delay(
        email=email_address.email,
        firstName=email_address.user.first_name,
        lastName=email_address.user.last_name,
        source="app",
        subscribed=True,
        userGroup="sign_up_verified",
        userId=email_address.user.id,
        mailingList={},
        tenantId=tenant.pk,
    )
