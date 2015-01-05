from django.conf.urls import include, patterns, url
from api.decorators import route_by_method
from api.v2.user import UserView
from api.v2.user_categories import UserCategoriesView
from api.v2.user_records import UserRecordsView
from api.v2.user_posts import UserPostsView
from api.v2.category import CategoryView
from api.v2.post import PostView
from api.v2.record_view import RecordView
from api.v2.record_posts import RecordPostsView
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

urlpatterns += patterns('api.v2',
    (r'^v2/users/(?P<name>[A-Za-z0-9_-]+)$', UserView.as_view()),
    (r'^v2/users/(?P<name>[A-Za-z0-9_-]+)/categories$', UserCategoriesView.as_view()),
    (r'^v2/users/(?P<name>[A-Za-z0-9_-]+)/records$', UserRecordsView.as_view()),
    (r'^v2/users/(?P<name>[A-Za-z0-9_-]+)/posts$', UserPostsView.as_view()),
    (r'^v2/records/(?P<id>[0-9]+)$', RecordView.as_view()),
    (r'^v2/records/(?P<id>[0-9]+)/posts$', RecordPostsView.as_view()),
    (r'^v2/posts/(?P<id>[0-9]+)$', PostView.as_view()),
    (r'^v2/categories/(?P<id>[0-9]+)$', CategoryView.as_view()),
)
