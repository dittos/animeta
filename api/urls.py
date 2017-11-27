from django.conf.urls import url
from api.v2.auth import AuthView
from api.v2.accounts import AccountsView
from api.v2.user_password import UserPasswordView
from api import admin

urlpatterns = [
    # v2
    url(r'^v2/auth$', AuthView.as_view()),
    url(r'^v2/accounts$', AccountsView.as_view()),
    url(r'^v2/me/password$', UserPasswordView.as_view()),

    # admin
    url(r'^admin/works$', admin.WorksView.as_view()),
    url(r'^admin/works/(?P<id>[0-9]+)$', admin.WorkView.as_view()),
    url(r'^admin/works/(?P<id>[0-9]+)/title-mappings$', admin.WorkTitleMappingsView.as_view()),
    url(r'^admin/title-mappings/(?P<id>[0-9]+)$', admin.TitleMappingView.as_view()),
    url(r'^admin/studios$', admin.StudiosView.as_view()),
]
