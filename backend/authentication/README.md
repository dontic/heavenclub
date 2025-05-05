# Authentication module

## Basics

### Models:

- `User`: See the configuration section below
- `UserProfile`: Useful to set information not related to authentication like address, billing status, etc.


## Configuration

There are two possible User configurations:

### Default User model

It comes with the default django user fields pluss you can add as many fields as you want.

This user model required a username and password to log in.

### Email User model
It's a modified version of the user model where the username is not needed and the users register and log in with an email address instead.


## Account notifications

Account notifications are handled by Brevo.

To make it super easy to set these up, Brevo templates are used. Here are the 4 templates you can set up:

### Email Verification

If email verification is active you can send the transactional email with the url activation.

**Environment variables:**
- EMAIL_VERIFICATION_URL: The frontend url that the user is redirected to to verify their email address.
- BREVO_VERIFICATION_EMAIL_TEMPLATE_ID: The template ID of the email to send the url.

**Template required params:**
- ACTIVATE_URL: The full url to redirect the user to activate their email


### Password reset
**Environment variables:**
- PASSWORD_RESET_CONFIRM_URL: The frontend url that the user is redirected to to reset their password.
- BREVO_PASSWORD_RESET_EMAIL_TEMPLATE_ID: The template ID of the email to send the url.

**Template required params:**
- PASSWORD_RESET_URL: The full url to redirect the user to reset their password

### Password changed confirmation
**Environment variables:**
- BREVO_PASSWORD_CHANGED_EMAIL_TEMPLATE_ID: The template ID of the email.
