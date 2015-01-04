from django.conf.urls import patterns, url
from user.views import HistoryFeedView

urlpatterns = patterns('user.views',
    (r'^$', 'library'),
    url(r'^history/$', 'history_compat', name='user-history'),
    url(r'^history/(?P<id>\d+)/$', 'history_detail_compat'),
    url(r'^feed/$', HistoryFeedView.as_view(), name='user-history-feed'),
)
