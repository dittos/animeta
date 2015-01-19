from django.conf.urls import include, patterns, url

urlpatterns = patterns('work.views',
    (r'^(?P<title>.*)/videos/(?P<provider>[a-z]+)/(?P<id>.+)/$', 'video'),
    (r'^(?P<title>.*)/users/$', 'list_users'),
    (r'^(?P<title>.*)/ep/(?P<ep>[0-9]+)/$', 'episode_detail'),
    (r'^(?P<title>.*)/$', 'detail'),
)
