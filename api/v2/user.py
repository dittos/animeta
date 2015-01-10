# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from api.v2 import BaseView
from api.serializers import serialize_user

class UserView(BaseView):
    def get(self, request, name):
        user = get_object_or_404(User, username=name)
        return serialize_user(user, request.user)
