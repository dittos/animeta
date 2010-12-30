from django.conf.urls.defaults import *

urlpatterns = patterns('api.views',
	(r'^v1/records/(?P<id>[0-9]+)$', 'get_record'),
	(r'^v1/records$', 'get_records'),
	(r'^v1/users/(?P<name>[A-Za-z0-9_-]+)$', 'get_user'),
	(r'^v1/works/(?P<id>[0-9]+)$', 'get_work'),
)
