# Generated by Django 5.1.8 on 2025-05-08 14:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_user_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='last_accessed',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
