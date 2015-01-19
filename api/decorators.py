import re
import json
import plistlib
import functools
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from .models import get_user_from_token

def fallback_encode_json(obj):
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    else:
        raise TypeError(repr(obj))

def _json_writefunc(data, stream, callback=None):
    if callback: stream.write(callback + '(')
    json.dump(data, stream, default=fallback_encode_json)
    if callback: stream.write(')')

def api_response(view):
    @functools.wraps(view)
    def wrapper(request, *args, **kwargs):
        if not hasattr(request, 'internal'):
            request.internal = False
        result = view(request, *args, **kwargs)
        if request.internal:
            return result
        format = request.GET.get('format', 'json')
        if format == 'plist':
            mime = 'application/x-plist'
            writefunc = plistlib.writePlist
        else: # format == 'json'
            cb = request.REQUEST.get('callback', None)
            if cb:
            	cb = re.sub('[^A-Za-z0-9_$]', '', cb)
            	mime = 'application/javascript'
            else:
                mime = 'application/json'
            writefunc = lambda d, s: _json_writefunc(d, s, cb)
        response = HttpResponse(content_type=mime, status=result.get('error_code', 422) if 'error' in result else 200)
        writefunc(result, response)
        return response
    return wrapper

def route_by_method(**mapping):
    def view(request, *args, **kwargs):
        return mapping[request.method](request, *args, **kwargs)
    return require_http_methods(mapping.keys())(view)

def api_auth_required(view):
    @functools.wraps(view)
    def _inner(request, *args, **kwargs):
        if 'HTTP_X_ANIMETA_TOKEN' in request.META:
            # Using Simple Auth mode
            token = request.META['HTTP_X_ANIMETA_TOKEN']
            user = get_user_from_token(token)
            if not user:
                return HttpResponse('Invalid session token.', status=403)
            request.user = user
        return login_required(view)(request, *args, **kwargs)
    return _inner
