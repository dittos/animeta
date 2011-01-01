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

from oauth_provider.decorators import CheckOAuth as CheckOAuthBase
from oauth2 import Error

from django.utils.translation import ugettext as _

from oauth_provider.utils import initialize_server_request, send_oauth_error, get_oauth_request
from oauth_provider.store import store, InvalidTokenError

def oauth_required(view_func=None, resource_name=None):
    return CheckOAuth(view_func, resource_name)

class CheckOAuth(CheckOAuthBase):
    def __get__(self, obj, cls=None):
        view_func = self.view_func.__get__(obj, cls)
        return CheckOAuth(view_func, self.resource_name)
    
    def __call__(self, request, *args, **kwargs):
        if self.is_valid_request(request):
            oauth_request = get_oauth_request(request)
            consumer = store.get_consumer(request, oauth_request, 
                            oauth_request.get_parameter('oauth_consumer_key'))
            try:
                token = store.get_access_token(request, oauth_request, 
                                consumer, oauth_request.get_parameter('oauth_token'))
            except InvalidTokenError:
                return send_oauth_error(Error(_('Invalid access token: %s') % oauth_request.get_parameter('oauth_token')))
            try:
                parameters = self.validate_token(request, consumer, token)
            except Error, e:
                return send_oauth_error(e)
            
            if consumer and token:
				request.user = token.user
                return self.view_func(request, *args, **kwargs)
        
        return send_oauth_error(Error(_('Invalid request parameters.')))
