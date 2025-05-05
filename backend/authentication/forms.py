from django import forms
from django.utils.translation import gettext_lazy as _
from tenants.models import Tenant, TenantUser


class CustomSignupForm(forms.Form):
    # email = forms.EmailField(
    #     widget=forms.TextInput(
    #         attrs={
    #             "type": "email",
    #             "placeholder": _("Email address"),
    #             "autocomplete": "email",
    #         }
    #     )
    # )
    first_name = forms.CharField(
        label=_("First Name"),
        widget=forms.TextInput(
            attrs={"placeholder": _("First Name"), "autocomplete": "first-name"}
        ),
    )
    team_name = forms.CharField(
        label=_("Team Name"),
        widget=forms.TextInput(
            attrs={"placeholder": _("Team Name"), "autocomplete": "team-name"}
        ),
    )

    def signup(self, request, user):
        """
        Invoked at signup time to complete the signup of the user.
        """

        # Create the tenant and the tenant user
        try:
            tenant = Tenant.objects.create(name=self.cleaned_data["team_name"])
            TenantUser.objects.create(tenant=tenant, user=user, role="OWNER")
        except Exception as e:
            raise forms.ValidationError(_("Error creating tenant"))

        pass
