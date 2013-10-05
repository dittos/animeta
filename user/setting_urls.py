from django.conf.urls.defaults import *

urlpatterns = patterns('',
    (r'^$', 'django.contrib.auth.views.password_change', {'template_name': 'user/settings.html', 'post_change_redirect': '/settings/?changed=true'}),
)
