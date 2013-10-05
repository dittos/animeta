from django.conf.urls.defaults import *
from django.conf import settings

import user.views
from django.contrib.auth.decorators import login_required

urlpatterns = patterns('',
    (r'^$', 'chart.views.main'),
    (r'^timeline/$', 'chart.views.timeline'),
    (r'^login/', 'user.views.login'),
    (r'^logout/', 'django.contrib.auth.views.logout', {'next_page': '/'}),
    (r'^signup/', 'user.views.signup'),
    (r'^settings/', include('user.setting_urls')),
    (r'^api/', include('api.urls')),

    (r'^library/', login_required(user.views.library)),
    (r'^users/(?P<username>[A-Za-z0-9_]+)/', include('user.urls')),
    (r'^records/', include('record.urls')),
    (r'^works/', include('work.urls')),
    (r'^charts/', include('chart.urls')),
    (r'^connect/', include('connect.urls')),
    (r'^moderation/', include('moderation.urls')),

    (r'^titles/(?P<remainder>.*)/$', 'work.views.old_url'), # compat
    (r'^(?P<username>[A-Za-z0-9]+)$', 'user.views.shortcut'),
    (r'^-(?P<id>[0-9]+)$', 'record.views.shortcut'),
)
