# -*- coding: utf-8 -*-
import time
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from api.v2 import BaseView

__all__ = ['AccountsView']


def serialize_user(user):
    return {
        'id': user.id,
        'name': user.username,
        'date_joined': serialize_datetime(user.date_joined),
    }


def serialize_datetime(dt):
    if dt is None:
        return None
    seconds = time.mktime(dt.timetuple()) + dt.microsecond / 1000000.0
    return int(seconds * 1000)


class AccountsView(BaseView):
    def post(self, request):
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            request.session.set_expiry(0)
            request.session.save()
            return {'ok': True,
                    'user': serialize_user(user),
                    'session_key': request.session.session_key}
        return {'ok': False, 'errors': form.errors}
