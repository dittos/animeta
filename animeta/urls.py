from django.conf.urls.defaults import *
from django.conf import settings

import animeta.user.views
from django.contrib.auth.decorators import login_required

urlpatterns = patterns('',
    (r'^$', 'animeta.chart.views.main'),
    (r'^timeline/$', 'animeta.chart.views.timeline'),
    (r'^login/', 'animeta.user.views.login'),
    (r'^logout/', 'django.contrib.auth.views.logout', {'next_page': '/'}),
    (r'^signup/', 'animeta.user.views.signup'),
    (r'^settings/', include('animeta.user.setting_urls')),
    (r'^api/', include('animeta.api.urls')),

    (r'^library/', login_required(animeta.user.views.library)),
    (r'^users/(?P<username>[A-Za-z0-9_]+)/library/', include('animeta.library.urls')),
    (r'^users/(?P<username>[A-Za-z0-9_]+)/', include('animeta.user.urls')),
    (r'^records/', include('animeta.record.urls')),
    (r'^works/', include('animeta.work.urls')),
    (r'^charts/', include('animeta.chart.urls')),
    (r'^connect/', include('animeta.connect.urls')),

    (r'^titles/(?P<remainder>.*)$', 'animeta.work.views.old_url'), # compat
    (r'^(?P<username>[A-Za-z0-9]+)$', 'animeta.user.views.shortcut'),
    (r'^-(?P<id>[0-9]+)$', 'animeta.record.views.shortcut'),
)
