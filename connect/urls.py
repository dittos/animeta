from django.conf.urls.defaults import *
from django.views.generic import TemplateView

urlpatterns = patterns('',
    (r'^$', 'connect.views.services'),
    (r'^me2day/$', 'connect.views.me2day'),
    (r'^me2day/disconnect/$', 'connect.views.me2day_disconnect'),
    (r'^twitter/$', 'connect.views.twitter'),
    (r'^twitter/disconnect/$', 'connect.views.twitter_disconnect'),
    (r'^facebook/$', 'connect.views.facebook'),
    (r'^facebook/disconnect/$', 'connect.views.facebook_disconnect'),
    (r'^widget/$', TemplateView.as_view(template_name='connect/widget.html')),
)
