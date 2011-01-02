import json
import functools
from django.http import HttpResponse

def json_response(view):
	@functools.wraps(view)
	def wrapper(*args, **kwargs):
		response = HttpResponse(mimetype='application/json')
		json.dump(view(*args, **kwargs), response)
		return response
	return wrapper
