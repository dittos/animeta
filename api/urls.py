from django.conf.urls import include, patterns, url
from api.decorators import route_by_method
from api.v2.auth import AuthView
from api.v2.accounts import AccountsView
from api.v2.chart_view import PopularWorksChartView
from api.v2.table_period import TablePeriodView
from api.v2.user import UserView
from api.v2.user_categories import UserCategoriesView
from api.v2.user_records import UserRecordsView
from api.v2.user_posts import UserPostsView
from api.v2.category import CategoryView
from api.v2.post import PostView
from api.v2.posts import PostsView
from api.v2.record_view import RecordView
from api.v2.record_posts import RecordPostsView
from api.v2.work_view import WorkView
from api.v2.work_posts import WorkPostsView
from api.views import *

urlpatterns = patterns('api.views',
    (r'^v1/records/(?P<id>[0-9]+)$', route_by_method(GET=get_record, DELETE=delete_record)),
    (r'^v1/records$', route_by_method(GET=get_records, POST=create_record)),
    (r'^v1/users/(?P<name>[\w.@+-]+)$', 'get_user'),
    (r'^v1/me$', 'get_current_user'),
    (r'^v1/works$', 'get_works'),
    (r'^v1/works/(?P<title>.+)$', 'get_work_by_title'),
    (r'^v1/charts/(?P<type>.+)$', 'get_chart'),
    (r'^auth/sessions/', 'auth'),
)

urlpatterns += patterns('api.v2',
    (r'^v2/auth$', AuthView.as_view()),
    (r'^v2/accounts$', AccountsView.as_view()),
    (r'^v2/me', UserView.as_view()),
    (r'^v2/users/(?P<name>[\w.@+-]+)$', UserView.as_view()),
    (r'^v2/users/(?P<name>[\w.@+-]+)/categories$', UserCategoriesView.as_view()),
    (r'^v2/users/(?P<name>[\w.@+-]+)/records$', UserRecordsView.as_view()),
    (r'^v2/users/(?P<name>[\w.@+-]+)/posts$', UserPostsView.as_view()),
    (r'^v2/records/(?P<id>[0-9]+)$', RecordView.as_view()),
    (r'^v2/records/(?P<id>[0-9]+)/posts$', RecordPostsView.as_view()),
    (r'^v2/posts$', PostsView.as_view()),
    (r'^v2/posts/(?P<id>[0-9]+)$', PostView.as_view()),
    (r'^v2/categories/(?P<id>[0-9]+)$', CategoryView.as_view()),
    (r'^v2/works/(?P<id>[0-9]+)$', WorkView.as_view()),
    (r'^v2/works/(?P<id>_)/(?P<title>.+)$', WorkView.as_view()),
    (r'^v2/works/(?P<id>[0-9]+)/posts$', WorkPostsView.as_view()),
    (r'^v2/charts/works/weekly$', PopularWorksChartView.as_view()),
    (r'^v2/table/periods/(?P<period>[0-9]{4}Q[1-4])', TablePeriodView.as_view()),
)
