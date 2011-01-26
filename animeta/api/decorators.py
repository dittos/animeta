import json
import plistlib
import functools
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods

def api_response(view):
	@functools.wraps(view)
	def wrapper(request, *args, **kwargs):
		format = request.GET.get('format', 'json')
		if format == 'plist':
			mime = 'application/x-plist'
			writefunc = plistlib.writePlist
		else: # format == 'json'
			mime = 'application/json'
			writefunc = json.dump
		result = view(request, *args, **kwargs)
		response = HttpResponse(mimetype=mime, status=422 if 'error' in result else 200)
		writefunc(result, response)
		return response
	return wrapper

def route_by_method(**mapping):
	def view(request, *args, **kwargs):
		return mapping[request.method](request, *args, **kwargs)
	return require_http_methods(mapping.keys())(view)
