# Introduction

This devcontainer will create 3 containers:
- A python container to develop django
- A postgres database
- A redis database (i.e. For celery)

# Configuration

## Postgres Data

Add `postgresdata` to your `.gitignore`. The postgres container will create a `postgresdata` directory inside your `.devcontainer` directory with the database information.

## Postgres configuration

By default postgres will have a database named `django` with user `django` and password `django`. You can modify this in `docker-compose.yml` AND in `provision_postgres.sql`.


# Starting the devcontainer

To start the dev container just run:
```
Dev Containers: Reopen in Container
```

# Initial setup

## Install dependencies
```
pipenv install --dev
```

## Start the environment
```
pipenv shell
```

## Start django
```
python manage.py runserver 0.0.0.0:8000
```

# Reset the database

If you want to reset the database, you can do so by stopping all the containers and removing the postgres container and `postgresdata` directory.

You can then start the devcontainer again and it will create a new postgres container and database.