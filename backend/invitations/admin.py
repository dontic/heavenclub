from django.contrib import admin
from .models import Invitation


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "invitation_accepted",
        "invitation_accepted_at",
        "created_at",
    )
    list_filter = ("invitation_accepted",)
    search_fields = ("user__email",)
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
