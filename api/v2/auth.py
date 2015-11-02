# -*- coding: utf-8 -*-
from api.v2 import BaseView
from django.contrib.auth import authenticate, login, logout


class AuthView(BaseView):
    def get(self, request):
        return {'ok': request.user.is_authenticated()}

    def post(self, request):
        user = authenticate(
            username=request.POST['username'],
            password=request.POST['password']
        )
        if not user or not user.is_active:
            return {'ok': False}
        if request.POST.get('transient') == 'false':
            request.session.set_expiry(3600 * 24 * 14)
        else:
            request.session.set_expiry(0)
        login(request, user)
        return {'ok': True}

    def delete(self, request):
        logout(request)
        return {'ok': True}
