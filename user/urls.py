from django.conf.urls import patterns, url
from user.views import HistoryFeedView
from record.views import HistoryDetailView

urlpatterns = patterns('user.views',
    (r'^$', 'library'),
    url(r'^history/$', 'history_compat', name='user-history'),
    url(r'^feed/$', HistoryFeedView.as_view(), name='user-history-feed'),
)

urlpatterns += patterns('',
    url(r'^history/(?P<id>\d+)/$', HistoryDetailView.as_view(), name='history-detail'),
)
