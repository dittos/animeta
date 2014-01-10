from django.conf.urls import include, patterns, url
from work.views import SearchView

urlpatterns = patterns('work.views',
    (r'^search/', SearchView.as_view()),
    (r'^merge-dashboard/$', 'merge_dashboard'),
    (r'^(?P<title>.*)/videos/(?P<provider>[a-z]+)/(?P<id>.+)/$', 'video'),
    (r'^(?P<title>.*)/users/$', 'list_users'),
    (r'^(?P<title>.*)/$', 'detail'),
)
