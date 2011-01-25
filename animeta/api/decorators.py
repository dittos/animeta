import json
import plistlib
import functools
from django.http import HttpResponse

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
		response = HttpResponse(mimetype=mime)
		writefunc(result, response)
		return response
	return wrapper
