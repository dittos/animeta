from django.conf.urls.defaults import *

urlpatterns = patterns('',
	(r'^$', 'django.views.generic.simple.direct_to_template', {'template': 'connect/services.html'}),
	(r'^me2day/$', 'connect.views.me2day'),
	(r'^me2day/disconnect/$', 'connect.views.me2day_disconnect'),
	(r'^widget/$', 'django.views.generic.simple.direct_to_template', {'template': 'connect/widget.html'}),
)
