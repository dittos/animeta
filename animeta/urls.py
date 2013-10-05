from django.conf.urls import patterns, include, url

import user.views
from django.contrib.auth.decorators import login_required
from chart.views import TimelineView

urlpatterns = patterns('',
    (r'^$', 'chart.views.main'),
    (r'^timeline/$', TimelineView.as_view()),
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
