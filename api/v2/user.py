# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from api.v2 import BaseView
from api.serializers import serialize_user


class UserView(BaseView):
    def get(self, request, name=None, id=None):
        if name:
            user = get_object_or_404(User, username=name)
        elif id:
            user = get_object_or_404(User, id=id)
        else:
            user = request.user
            if not user.is_authenticated():
                self.raise_error('Not logged in', 403)
        return serialize_user(user, request.user)
