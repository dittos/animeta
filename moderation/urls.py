from django.conf.urls.defaults import *

urlpatterns = patterns('moderation.views',
    (r'^merge/$', 'merge_dashboard'),
)
