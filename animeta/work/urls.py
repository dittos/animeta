from django.conf.urls.defaults import *

urlpatterns = patterns('work.views',
	(r'^(?P<title>.*)/videos/(?P<provider>[a-z]+)/(?P<id>.+)/$', 'video'),
	(r'^(?P<title>.*)/$', 'detail'),
)
