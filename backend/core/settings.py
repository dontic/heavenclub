"""
Django settings for core project.

Generated by 'django-admin startproject' using Django 5.0.2.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import logging.config

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------- #
#                                   DEBUGGING                                  #
# ---------------------------------------------------------------------------- #

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"

# Logging
LOGGING_CONFIG: None = None  # Avoid Django logging setup
LOGGING = {
    "version": 1,
    # Set to True to disable Django's logging setup
    "disable_existing_loggers": True,
    # Define the formatters
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(levelname)s - %(name)s - %(module)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    # Define the handlers
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",  # Log to console
            "formatter": "default",  # Use the default formatter
        }
    },
    # Uncomment to log with the root logger
    # "root": {"level": "WARNING", "handlers": ["console"]},
    "loggers": {
        # Consistent logger for the application
        # Use `log = logging.getLogger("app_logger")` in your code
        "app_logger": {
            "level": os.getenv("LOGGING_LOG_LEVEL", "DEBUG"),
            "handlers": ["console"],
            "propagate": False,
        },
        # Django logger
        "django": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False,
        },
        # Celery logger
        "celery": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False,
        },
        # Celery beat logger
        "celery.beat": {
            "level": "WARNING",
            "handlers": ["console"],
            "propagate": False,
        },
        # Authentication logger
        "authentication": {
            "level": os.getenv("LOGGING_LOG_LEVEL", "DEBUG"),
            "handlers": ["console"],
            "propagate": False,
        },
        # Utils logger
        "utils": {
            "level": os.getenv("LOGGING_LOG_LEVEL", "DEBUG"),
            "handlers": ["console"],
            "propagate": False,
        },
    },
}
logging.config.dictConfig(LOGGING)

# ---------------------------------------------------------------------------- #
#                                  CONNECTIONS                                 #
# ---------------------------------------------------------------------------- #
# SECURITY WARNING: keep the secret key used in production secret!
if "DJANGO_SECRET_KEY" not in os.environ:
    raise ValueError("DJANGO_SECRET_KEY environment variable not set.")
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")

# Hosts
if "DJANGO_ALLOWED_HOSTS" not in os.environ:
    raise ValueError("DJANGO_ALLOWED_HOSTS environment variable not set.")
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",")
if DEBUG:
    ALLOWED_HOSTS.extend(["localhost", "127.0.0.1", "*"])

# CSRF
if "DJANGO_ALLOWED_ORIGINS" not in os.environ:
    raise ValueError("DJANGO_ALLOWED_ORIGINS environment variable not set.")
CSRF_TRUSTED_ORIGINS = os.getenv("DJANGO_ALLOWED_ORIGINS", "").split(",")

CSRF_COOKIE_NAME = os.getenv("DJANGO_CSRF_COOKIE_NAME", "csrftoken")

CSRF_COOKIE_DOMAIN = os.getenv("DJANGO_CSRF_COOKIE_DOMAIN")

CSRF_COOKIE_SAMESITE = None
CSRF_COOKIE_SECURE = False
CSRF_USE_SESSIONS = False
CSRF_COOKIE_HTTPONLY = False

# CORS settings
CORS_ORIGIN_WHITELIST = os.getenv("DJANGO_ALLOWED_ORIGINS", "").split(",")
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_ALLOW_ALL = DEBUG  # Allow all origins in debug mode

CORS_ALLOW_METHODS = ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# Sessions
if "DJANGO_SESSION_COOKIE_DOMAIN" not in os.environ:
    raise ValueError("DJANGO_SESSION_COOKIE_DOMAIN environment variable is not set.")
SESSION_COOKIE_DOMAIN = os.getenv("DJANGO_SESSION_COOKIE_DOMAIN")

SESSION_COOKIE_SAMESITE = None
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_HTTPONLY = False


# ---------------------------------------------------------------------------- #
#                                INSTALLED APPS                                #
# ---------------------------------------------------------------------------- #
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.messages",
    "django.contrib.sessions",
    "django.contrib.sites",
    "django.contrib.staticfiles",
    # ----------------------------------- CORS ----------------------------------- #
    "corsheaders",  # Django CORS Headers
    # ----------------------------------- REST ----------------------------------- #
    "rest_framework",  # Django REST Framework
    "drf_spectacular",  # Django Spectacular
    "django_filters",  # Django Filters
    # ------------------------------ AUTHENTICATION ------------------------------ #
    "allauth",  # Django allauth
    "allauth.account",  # Django allauth Account
    "allauth.headless",  # REST implementation of allauth
    "allauth.socialaccount",  # Django allauth Social Account
    "authentication",  # Custom authentication app
    # ---------------------------------- CELERY ---------------------------------- #
    "django_celery_beat",  # Celery beat
    # -------------------------------- HEALTHCHECK ------------------------------- #
    "health_check",  # required
    "health_check.db",  # stock Django health checkers
    "health_check.cache",
    "health_check.storage",
    "health_check.contrib.migrations",
    "health_check.contrib.celery",  # requires celery
    "health_check.contrib.celery_ping",  # requires celery
    "health_check.contrib.redis",  # requires Redis broker
    # ------------------------------ DJANGO CLEANUP ------------------------------ #
    "django_cleanup",
    # ------------------------------ INVITATIONS --------------------------------- #
    "invitations",  # Custom invitations app
    # ------------------------------ CONTACTS ----------------------------------- #
    "contacts",  # Custom contacts app
]

# ---------------------------------------------------------------------------- #
#                                  MIDDLEWARE                                  #
# ---------------------------------------------------------------------------- #
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # Whitenoise
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # Django CORS Headers
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",  # Django AllAuth
    "authentication.middleware.LastAccessedMiddleware",  # Track user last accessed time
]

# ---------------------------------------------------------------------------- #
#                              URLS AND TEMPLATES                              #
# ---------------------------------------------------------------------------- #
ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                # `allauth` needs this from django
                "django.template.context_processors.request",
            ],
        },
    },
]

FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://heavenclub.es")


# ---------------------------------------------------------------------------- #
#                                     WSGI                                     #
# ---------------------------------------------------------------------------- #
WSGI_APPLICATION = "core.wsgi.application"


# ---------------------------------------------------------------------------- #
#                                   DATABASE                                   #
# ---------------------------------------------------------------------------- #

# --------------------------------- POSTGRES --------------------------------- #

# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
if not all(
    [
        "POSTGRES_DB_NAME" in os.environ,
        "POSTGRES_USER" in os.environ,
        "POSTGRES_PASSWORD" in os.environ,
        "POSTGRES_HOST" in os.environ,
        "POSTGRES_PORT" in os.environ,
    ]
):
    raise ValueError(
        "POSTGRES_DB_NAME, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST or POSTGRES_PORT environment variables not set."
    )


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB_NAME"),
        "USER": os.getenv("POSTGRES_USER"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
        "HOST": os.getenv("POSTGRES_HOST"),
        "PORT": os.getenv("POSTGRES_PORT"),
    }
}

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ----------------------------------- REDIS ---------------------------------- #
if not all(
    [
        "REDIS_HOST" in os.environ,
        "REDIS_PORT" in os.environ,
        "REDIS_DB" in os.environ,
    ]
):
    raise ValueError(
        "REDIS_HOST, REDIS_PORT or REDIS_DB environment variables not set."
    )

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_DB = os.getenv("REDIS_DB")

REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"

# ---------------------------------------------------------------------------- #
#                             Internationalization                             #
# ---------------------------------------------------------------------------- #
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# ---------------------------------------------------------------------------- #
#                            STATIC AND MEDIA ROUTES                           #
# ---------------------------------------------------------------------------- #

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_ROOT = BASE_DIR / "staticfiles"
STATIC_URL = "static/"

MEDIA_ROOT = BASE_DIR / "media"
MEDIA_URL = "media/"


# ---------------------------------------------------------------------------- #
#                                REST FRAMEWORK                                #
# ---------------------------------------------------------------------------- #

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.SessionAuthentication",
        # "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # "DEFAULT_THROTTLE_CLASSES": [
    #     "rest_framework.throttling.AnonRateThrottle",
    #     "rest_framework.throttling.UserRateThrottle",
    #     "rest_framework.throttling.ScopedRateThrottle",
    # ],
    # "DEFAULT_THROTTLE_RATES": {
    #     "anon": "10/hour",
    #     "user": "200/minute",
    # },
}

SPECTACULAR_SETTINGS = {
    "TITLE": "API",
    "DESCRIPTION": "Description placeholder",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    # OTHER SETTINGS
    "COMPONENT_SPLIT_REQUEST": True,
}


# ---------------------------------------------------------------------------- #
#                                AUTHENTICATION                                #
# ---------------------------------------------------------------------------- #

AUTH_USER_MODEL = "authentication.User"

# Single session per user
SINGLE_SESSION_PER_USER = True  # Set to False to allow multiple sessions per user

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


AUTHENTICATION_BACKENDS = [
    # Needed to login by username in Django admin, regardless of `allauth`
    "django.contrib.auth.backends.ModelBackend",
    # `allauth` specific authentication methods, such as login by email
    "allauth.account.auth_backends.AuthenticationBackend",
]

# ---------------------------------- ALLAUTH --------------------------------- #

# https://docs.allauth.org/en/latest/index.html


# Headless implementation
HEADLESS_ONLY = True
HEADLESS_ADAPTER = "authentication.adapter.CustomHeadlessAdapter"
ACCOUNT_ADAPTER = "authentication.adapter.CustomAccountAdapter"
HEADLESS_TOKEN_STRATEGY = "allauth.headless.tokens.sessions.SessionTokenStrategy"
HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": "https://app.project.org/account/verify-email/{key}",
    # Key placeholders are automatically populated. You are free to adjust this
    # to your own needs, e.g.
    #
    # "https://app.project.org/account/email/verify-email?token={key}",
    "account_reset_password": "https://app.project.org/account/password/reset",
    "account_reset_password_from_key": "https://app.project.org/account/password/reset/key/{key}",
    "account_signup": "https://app.project.org/account/signup",
    # Fallback in case the state containing the `next` URL is lost and the handshake
    # with the third-party provider fails.
    "socialaccount_login_error": "https://app.project.org/account/provider/callback",
}

# Email vs. username stuff
ACCOUNT_LOGIN_METHODS = {"email"}  # username, email or username_email
ACCOUNT_USER_MODEL_USERNAME_FIELD: str | None = None
ACCOUNT_SIGNUP_FIELDS = ["email*"]
ACCOUNT_UNIQUE_EMAIL = True

# Email verification
ACCOUNT_EMAIL_VERIFICATION = "mandatory"  # "none", "optional", "mandatory"
ACCOUNT_EMAIL_VERIFICATION_BY_CODE_ENABLED = (
    True  # Enable email verification by Magic Code
)
ACCOUNT_EMAIL_VERIFICATION_BY_CODE_MAX_ATTEMPTS = 3
ACCOUNT_EMAIL_VERIFICATION_BY_CODE_TIMEOUT = 15 * 60  # 15 minutes
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True

# Social accounts
SOCIALACCOUNT_QUERY_EMAIL = True  # Needed to set email as the username
SOCIALACCOUNT_LOGIN_ON_GET = True  # Needed to login with social accounts
SOCIALACCOUNT_STORE_TOKENS = True  # Needed to access Provider's APIs
ACCOUNT_EMAIL_UNKNOWN_ACCOUNTS = (
    False  # Do not allow unknown accounts to reset password
)

# Enable login by code
ACCOUNT_LOGIN_BY_CODE_ENABLED = True
ACCOUNT_LOGIN_BY_CODE_REQUIRED = True
ACCOUNT_LOGIN_BY_CODE_TIMEOUT = 60 * 15  # 15 minutes
ACCOUNT_LOGIN_BY_CODE_MAX_ATTEMPTS = 5


# allauth providers
# https://docs.allauth.org/en/latest/socialaccount/provider_configuration.html
SOCIALACCOUNT_PROVIDERS: dict[str, dict] = {}

# Site ID is needed for allauth
SITE_ID = 1


# ---------------------------------------------------------------------------- #
#                                    CELERY                                    #
# ---------------------------------------------------------------------------- #
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", REDIS_URL)
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", REDIS_URL)
CELERY_ACCEPT_CONTENT = ["application/json"]
CELERY_RESULT_SERIALIZER = "json"
CELERY_TASK_SERIALIZER = "json"

# Configure Beat Periodic Tasks in the database
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"


# ---------------------------------------------------------------------------- #
#                                     LOOPS                                    #
# ---------------------------------------------------------------------------- #

# Ensure that all the email templates are set
if any(
    [
        "LOOPS_VERIFY_EMAIL_TRANSACTIONAL_ID" not in os.environ,
        "LOOPS_LOGIN_CODE_TRANSACTIONAL_ID" not in os.environ,
        "LOOPS_INVITATION_TRANSACTIONAL_ID" not in os.environ,
        "LOOPS_CONTACT_TRANSACTIONAL_ID" not in os.environ,
    ]
):
    raise ValueError(
        """Not all Loops transactional IDs are set:
- LOOPS_VERIFY_EMAIL_TRANSACTIONAL_ID
- LOOPS_LOGIN_CODE_TRANSACTIONAL_ID
- LOOPS_INVITATION_TRANSACTIONAL_ID
- LOOPS_CONTACT_TRANSACTIONAL_ID
"""
    )

LOOPS_VERIFY_EMAIL_TRANSACTIONAL_ID = os.getenv("LOOPS_VERIFY_EMAIL_TRANSACTIONAL_ID")
LOOPS_LOGIN_CODE_TRANSACTIONAL_ID = os.getenv("LOOPS_LOGIN_CODE_TRANSACTIONAL_ID")
LOOPS_INVITATION_TRANSACTIONAL_ID = os.getenv("LOOPS_INVITATION_TRANSACTIONAL_ID")
LOOPS_CONTACT_TRANSACTIONAL_ID = os.getenv("LOOPS_CONTACT_TRANSACTIONAL_ID")

# ---------------------------------------------------------------------------- #
#                                 HEALTH CHECK                                 #
# ---------------------------------------------------------------------------- #
HEALTH_CHECK = {
    "SUBSETS": {
        "startup-probe": ["MigrationsHealthCheck", "DatabaseBackend"],
        "liveness-probe": ["DatabaseBackend"],
        "celery-probe": ["CeleryHealthCheckCelery", "CeleryPingHealthCheck"],
        "redis-probe": ["RedisHealthCheck"],
    },
}
