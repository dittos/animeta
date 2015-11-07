# -*- coding: utf-8 -*-
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from api.v2 import BaseView
from api.serializers import serialize_user


class AccountsView(BaseView):
    def post(self, request):
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            request.session.set_expiry(0)
            return {'ok': True, 'user': serialize_user(user)}
        return {'ok': False, 'errors': form.errors}
