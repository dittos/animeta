from django.conf.urls import url
from api.v2.auth import AuthView
from api.v2.accounts import AccountsView
from api.v2.chart_view import PopularWorksChartView, ChartView
from api.v2.external_service import TwitterView, TwitterConnectView
from api.v2.search_view import SearchView, SuggestView
from api.v2.table_period import TablePeriodView
from api.v2.user import UserView
from api.v2.user_categories import UserCategoriesView
from api.v2.user_password import UserPasswordView
from api.v2.user_records import UserRecordsView
from api.v2.user_posts import UserPostsView
from api.v2.category import CategoryView
from api.v2.post import PostView
from api.v2.posts import PostsView
from api.v2.record_view import RecordView
from api.v2.record_posts import RecordPostsView
from api.v2.work_view import WorkView
from api.v2.work_posts import WorkPostsView
from api import admin
from chart.models import PopularWorksChart, ActiveUsersChart

urlpatterns = [
    # v2
    url(r'^v2/auth$', AuthView.as_view()),
    url(r'^v2/accounts$', AccountsView.as_view()),
    url(r'^v2/me$', UserView.as_view()),
    url(r'^v2/me/password$', UserPasswordView.as_view()),
    url(r'^v2/me/external-services/twitter$', TwitterView.as_view()),
    url(r'^v2/me/external-services/twitter/connect$',
        TwitterConnectView.as_view(), name='twitter-connect'),
    url(r'^v2/users/(?P<name>[\w.@+-]+)$', UserView.as_view()),
    url(r'^v2/users/(?P<name>[\w.@+-]+)/categories$',
        UserCategoriesView.as_view()),
    url(r'^v2/users/(?P<name>[\w.@+-]+)/records$', UserRecordsView.as_view()),
    url(r'^v2/users/(?P<name>[\w.@+-]+)/posts$', UserPostsView.as_view()),
    url(r'^v2/records/(?P<id>[0-9]+)$', RecordView.as_view()),
    url(r'^v2/records/(?P<id>[0-9]+)/posts$', RecordPostsView.as_view()),
    url(r'^v2/posts$', PostsView.as_view()),
    url(r'^v2/posts/(?P<id>[0-9]+)$', PostView.as_view()),
    url(r'^v2/categories/(?P<id>[0-9]+)$', CategoryView.as_view()),
    url(r'^v2/works/(?P<id>[0-9]+)$', WorkView.as_view()),
    url(r'^v2/works/(?P<id>_)/(?P<title>.+)$', WorkView.as_view()),
    url(r'^v2/works/(?P<id>[0-9]+)/posts$', WorkPostsView.as_view()),
    url(r'^v2/charts/popular-works/(?P<range>weekly|monthly|overall)$',
        ChartView.as_view(chart_class=PopularWorksChart)),
    url(r'^v2/charts/active-users/(?P<range>weekly|monthly|overall)$',
        ChartView.as_view(chart_class=ActiveUsersChart)),
    url(r'^v2/table/periods/(?P<period>[0-9]{4}Q[1-4])$',
        TablePeriodView.as_view()),
    url(r'^v2/search$', SearchView.as_view()),
    url(r'^v2/search/suggest$', SuggestView.as_view()),

    # admin
    url(r'^admin/works$', admin.WorksView.as_view()),
    url(r'^admin/works/(?P<id>[0-9]+)$', admin.WorkView.as_view()),
    url(r'^admin/works/(?P<id>[0-9]+)/title-mappings$', admin.WorkTitleMappingsView.as_view()),
    url(r'^admin/title-mappings/(?P<id>[0-9]+)$', admin.TitleMappingView.as_view()),

    # deprecated
    url(r'^v2/charts/works/weekly$', PopularWorksChartView.as_view()),
]
