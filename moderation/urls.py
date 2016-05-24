from django.conf.urls import url
from moderation import views

urlpatterns = [
    url(r'^$', views.index),
    url(r'^works/$', views.create_work),
    url(r'^works/(?P<work_id>\d+)/$', views.work_detail),
    url(r'^works/(?P<work_id>\d+)/metadata/$', views.edit_metadata),
    url(r'^works/(?P<work_id>\d+)/delete/$', views.delete_work),
    url(r'^works/(?P<work_id>\d+)/merge/$', views.merge_work),
    url(r'^works/(?P<work_id>\d+)/mappings/$', views.add_mapping),
    url(r'^mappings/(?P<mapping_id>\d+)/set_primary_title/$',
     views.set_primary_title),
    url(r'^mappings/(?P<mapping_id>\d+)/delete/$', views.delete_mapping),
]
