from django.conf.urls.defaults import *

urlpatterns = patterns('library.views',
    url(r'^$', 'library'),
    url(r'^(?P<id>\d+)$', 'item_detail'),
    url(r'^(?P<id>\d+)/update$', 'update_item'),
)
