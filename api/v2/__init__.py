# -*- coding: utf-8 -*-
import json
from django.http import HttpResponse
from django.views.generic import View

class JsonResponse(HttpResponse):
    def __init__(self, obj, **kwargs):
        kwargs.setdefault('content_type', 'application/json')
        self.obj = obj # For testing
        data = json.dumps(obj, separators=(',', ':'))
        super(JsonResponse, self).__init__(data, **kwargs)

class HttpException(Exception):
    def __init__(self, response):
        self.response = response

class BaseView(View):
    def dispatch(self, request, *args, **kwargs):
        try:
            return JsonResponse(super(BaseView, self).dispatch(request, *args, **kwargs))
        except HttpException as e:
            return e.response

    def check_login(self):
        if not self.request.user.is_authenticated():
            self.raise_error('Login required.', status=401)

    def raise_error(self, message, status):
        raise HttpException(JsonResponse(message, status=status))
