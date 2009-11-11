from django.conf.urls.defaults import *
from django.conf import settings

urlpatterns = patterns('',
	(r'^$', 'animeta.user.views.welcome'),
	(r'^recent/$', 'animeta.chart.views.recent'),
	(r'^login/', 'animeta.user.views.login'),
	(r'^logout/', 'django.contrib.auth.views.logout', {'next_page': '/'}),
	(r'^signup/', 'animeta.user.views.signup'),
	(r'^accounts/profile/', 'animeta.user.views.library', {'username': None}),

	(r'^users/(?P<username>[A-Za-z0-9_]+)/', include('animeta.user.urls')),
	(r'^records/', include('animeta.record.urls')),
	(r'^works/', include('animeta.work.urls')),
	(r'^charts/', include('animeta.chart.urls')),
	(r'^connect/', include('animeta.connect.urls')),

	# compatability
	(r'^titles/(?P<remainder>.*)$', 'animeta.work.views.old_url'),
	(r'^(?P<username>[A-Za-z0-9]+)$', 'animeta.user.views.shortcut'),
)

if settings.DEBUG:
	urlpatterns += patterns('',
		(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.ROOT_PATH + '/static'})
	)
