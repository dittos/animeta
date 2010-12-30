class SubdomainRoutingMiddleware(object):
	def process_request(self, request):
		if request.META['HTTP_HOST'] == 'api.animeta.net':
			request.urlconf = 'animeta.api.urls'
