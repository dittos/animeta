from django.conf.urls import include, patterns, url

urlpatterns = patterns('record.views',
    (r'^add/(.+)/$', 'add'),
    (r'^add/$', 'add'),
    url(r'^(\d+)/$', 'update', name='record-detail'),
    (r'^(\d+)/delete/$', 'delete'),
    (r'^category/$', 'category'),
)
