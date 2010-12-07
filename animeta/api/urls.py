from django.conf.urls.defaults import *

urlpatterns = patterns('api.views',
	(r'^records/(?P<id>[0-9]+)$', 'get_record'),
	(r'^records$', 'get_records'),
	(r'^users/(?P<name>[A-Za-z0-9_-]+)$', 'get_user'),
	(r'^works/(?P<id>[0-9]+)$', 'get_work'),
)
