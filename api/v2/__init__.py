# -*- coding: utf-8 -*-
from django.http import HttpResponse, JsonResponse
from django.views.generic import View


class HttpException(Exception):
    def __init__(self, response):
        self.response = response


class BaseView(View):
    def dispatch(self, request, *args, **kwargs):
        try:
            response = super(BaseView, self).dispatch(request, *args, **kwargs)
        except HttpException as e:
            return e.response
        if not isinstance(response, HttpResponse):
            response = JsonResponse(response, safe=False)
        return response

    def check_login(self):
        if not self.request.user.is_authenticated():
            self.raise_error('Login required.', status=401)

    def raise_error(self, message, status):
        raise HttpException(JsonResponse({'message': message}, status=status))
