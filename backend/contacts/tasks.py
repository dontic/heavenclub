import logging
from celery import shared_task
from django.conf import settings
from utils.loops import send_transactional_email_task

log = logging.getLogger("app_logger")


@shared_task
def send_contact_notification(contact_id):
    """
    Send notification emails when a new contact is created
    """
    from .models import Contact

    try:
        contact = Contact.objects.get(id=contact_id)
    except Contact.DoesNotExist:
        log.error(f"Contact with ID {contact_id} not found")
        return False

    # Prepare data variables for the email template
    data_variables = {
        "CONTACT_NAME": contact.name,
        "CONTACT_EMAIL": contact.email,
        "CONTACT_PHONE": contact.phone,
        "CONTACT_MESSAGE": contact.message,
    }

    # List of recipients
    recipients = ["bobby.kite@hotmail.com", "heaven@mail.daniel.es"]

    # Send emails to all recipients
    for recipient in recipients:
        send_transactional_email_task.delay(
            transactional_id=settings.LOOPS_CONTACT_TRANSACTIONAL_ID,
            email=recipient,
            data_variables=data_variables,
        )

    log.info(f"Contact notification emails sent for contact {contact.id}")
    return True
