from django.contrib.auth.models import AnonymousUser
import api.views

class InternalRequest(object):
	internal = True

	def __init__(self, user, GET={}, POST={}):
		self.user = user
		self.GET = GET
		self.POST = POST

class API(object):
	def __init__(self, user=None):
		if user:
			self.user = user
		else:
			self.user = AnonymousUser()

	def __getattr__(self, name):
		return APIMethod(self, name)

class APIMethod(object):
	def __init__(self, api, name):
		self.name = name
		self.api = api

	def __call__(self, *args, **kwargs):
		params = {}
		for k, v in kwargs.iteritems():
			if isinstance(v, bool):
				v = 'true' if v else 'false'
			params[k] = v
		request = InternalRequest(self.api.user, params) # POST?
		return getattr(api.views, self.name)(request, *args)
