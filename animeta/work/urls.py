from django.conf.urls.defaults import *

urlpatterns = patterns('work.views',
	(r'^search/', 'search'),
	(r'^(?P<title>.*)/videos/(?P<provider>[a-z]+)/(?P<id>.+)/$', 'video'),
	(r'^(?P<title>.*)/users/$', 'list_users'),
	(r'^(?P<title>.*)/$', 'detail'),
)
