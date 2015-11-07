from django.conf.urls import include, url

urlpatterns = [
    url(r'^api/', include('api.urls')),
    url(r'^moderation/', include('moderation.urls')),
]
