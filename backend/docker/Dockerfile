FROM python:3.11-bullseye

EXPOSE 8000

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

# Install pipenv
RUN pip install -U pipenv

# Install pipenv requirements
# Note the changed path for Pipfile copies
COPY Pipfile Pipfile.lock /app/backend/
RUN pipenv requirements > requirements.txt
RUN pip install -r requirements.txt
RUN rm -rf ./Pipfile ./Pipfile.lock

# Copy all the code over from the context
COPY . .

# Create the media directory
RUN mkdir -p /app/backend/media

VOLUME /app/backend/media
VOLUME /app/backend/django_static

# Update paths to entrypoint scripts
RUN chmod +x /app/backend/docker/entrypoint-django.sh
RUN chmod +x /app/backend/docker/entrypoint-worker.sh
RUN chmod +x /app/backend/docker/entrypoint-beat.sh

# Update entrypoint path
ENTRYPOINT ["/app/backend/docker/entrypoint-django.sh"]