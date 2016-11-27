# -*- coding: utf-8 -*-
from django.conf import settings
from django.contrib.auth.models import User, AnonymousUser
from django.core import signing
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.utils.functional import SimpleLazyObject
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View


class HttpException(Exception):
    def __init__(self, response):
        self.response = response


class BaseView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        request.user = SimpleLazyObject(lambda: get_user(request))
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

    def raise_error(self, message, status, extra=None):
        data = {'message': message}
        if extra:
            data['extra'] = extra
        raise HttpException(JsonResponse(data, status=status))


def get_user(request):
    if not hasattr(request, '_cached_api_user'):
        request._cached_api_user = load_user(request)
    return request._cached_api_user


def load_user(request):
    try:
        session = signing.loads(request.META['HTTP_X_ANIMETA_SESSION_KEY'],
                                max_age=settings.SESSION_COOKIE_AGE,
                                salt='django.contrib.sessions.backends.signed_cookies')
    except:
        session = {}

    user_id = session.get('_auth_user_id')
    if user_id:
        # TODO: check _auth_user_hash
        return User.objects.get(pk=user_id)

    return AnonymousUser()
