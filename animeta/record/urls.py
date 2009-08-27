from django.conf.urls.defaults import *

urlpatterns = patterns('record.views',
	(r'^suggest/$', 'suggest'),
	(r'^add/(.+)/$', 'add'),
	(r'^add/$', 'add'),
	(r'^import/$', 'add_many'),
	(r'^(\d+)/update/$', 'update'),
	(r'^(\d+)/delete/$', 'delete'),
	(r'^save/$', 'save'),
)
