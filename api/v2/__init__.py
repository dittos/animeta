# -*- coding: utf-8 -*-
import json
from django.http import HttpResponse
from django.views.generic import View

def render_json(obj, **kwargs):
    return HttpResponse(json.dumps(obj), content_type='application/json', **kwargs)

class HttpException(Exception):
    def __init__(self, response):
        self.response = response

class BaseView(View):
    def dispatch(self, request, *args, **kwargs):
        try:
            return render_json(super(BaseView, self).dispatch(request, *args, **kwargs))
        except HttpException as e:
            return e.response

    def check_login(self):
        if not self.request.user.is_authenticated():
            self.raise_error('Login required.', status=401)

    def raise_error(self, message, status):
        raise HttpException(render_json(message, status=status))
