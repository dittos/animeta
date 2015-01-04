from django.conf.urls import include, patterns, url
from api.decorators import route_by_method
from api import views_v2 as v2
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

urlpatterns += patterns('api.views_v2',
    (r'^v2/me(?P<remainder>/.*)?$', v2.get_current_user),
    (r'^v2/users/(?P<name>[A-Za-z0-9_-]+)$', v2.UserView.as_view()),
    (r'^v2/users/(?P<name>[A-Za-z0-9_-]+)/categories$', v2.UserCategoriesView.as_view()),
    (r'^v2/categories/(?P<id>[0-9]+)$', v2.CategoryView.as_view()),
    (r'^v2/users/(?P<name>[A-Za-z0-9_-]+)/posts$', v2.UserPostsView.as_view()),
    (r'^v2/users/(?P<name>[A-Za-z0-9_-]+)/records$', v2.UserRecordsView.as_view()),
    (r'^v2/records/(?P<id>[0-9]+)/posts$', v2.RecordPostsView.as_view()),
    (r'^v2/records/(?P<id>[0-9]+)$', v2.RecordView.as_view()),
    (r'^v2/posts/(?P<id>[0-9]+)$', v2.PostView.as_view()),
)
