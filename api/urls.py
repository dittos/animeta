from django.conf.urls.defaults import *
from api.decorators import route_by_method
from api.views import *

urlpatterns = patterns('api.views',
    (r'^v1/records/(?P<id>[0-9]+)$', route_by_method(GET=get_record, DELETE=delete_record)),
    (r'^v1/records$', route_by_method(GET=get_records, POST=create_record)),
    (r'^v1/users/(?P<name>[A-Za-z0-9_-]+)$', 'get_user'),
    (r'^v1/me$', 'get_current_user'),
    (r'^v1/works$', 'get_works'),
    (r'^v1/works/(?P<title>.+)$', 'get_work_by_title'),
    (r'^v1/charts/(?P<type>.+)$', 'get_chart'),
    (r'^oauth/', include('oauth_provider.urls')),
    (r'^auth/sessions/', 'auth'),
)
