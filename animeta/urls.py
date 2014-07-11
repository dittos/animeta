from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView
import user.views
from chart.views import TimelineView

urlpatterns = patterns('',
    (r'^$', 'chart.views.main'),
    (r'^timeline/$', TimelineView.as_view()),
    (r'^login/', 'user.views.login'),
    (r'^logout/', 'django.contrib.auth.views.logout', {'next_page': '/'}),
    (r'^signup/', 'user.views.signup'),
    (r'^settings/', login_required(user.views.SettingsView.as_view())),
    (r'^support/', TemplateView.as_view(template_name='support.html')),
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

    (r'^search/$', 'search.views.search'),
    (r'^search/suggest/$', 'search.views.suggest'),

    url(r'^table/$', 'table.views.index', name='table-index'),
    url(r'^table/(?P<period>[0-9]{4}Q[1-4])/$', 'table.views.get_period', name='table-period'),
)
