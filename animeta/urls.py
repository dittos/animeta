from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView
import user.views

urlpatterns = patterns('',
    (r'^api/', include('api.urls')),
    (r'^moderation/', include('moderation.urls')),
)
