from django.conf.urls.defaults import *

urlpatterns = patterns('',
	(r'^$', 'connect.views.services'),
	(r'^me2day/$', 'connect.views.me2day'),
	(r'^me2day/disconnect/$', 'connect.views.me2day_disconnect'),
	(r'^twitter/$', 'connect.views.twitter'),
	(r'^twitter/disconnect/$', 'connect.views.twitter_disconnect'),
    (r'^facebook/$', 'connect.views.facebook'),
    (r'^facebook/disconnect/$', 'connect.views.facebook_disconnect'),
	(r'^widget/$', 'django.views.generic.simple.direct_to_template', {'template': 'connect/widget.html'}),
)
