from django.conf.urls.defaults import *

urlpatterns = patterns('user.views',
	(r'^$', 'library'),
	(r'^history/$', 'history'),
	(r'^feed/$', 'history_feed'),
)

urlpatterns += patterns('',
	(r'^history/(?P<id>\d+)/$', 'record.views.history_detail')
)
