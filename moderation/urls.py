from django.conf.urls import url
from moderation import views

urlpatterns = [
    url(r'^$', views.index, name='moderation-index'),
    url(r'^works/$', views.create_work, name='moderation-works'),
    url(r'^works/(?P<work_id>\d+)/$', views.work_detail, name='moderation-work'),
    url(r'^works/(?P<work_id>\d+)/metadata/$', views.edit_metadata, name='moderation-work-metadata'),
    url(r'^works/(?P<work_id>\d+)/delete/$', views.delete_work, name='moderation-work-delete'),
    url(r'^works/(?P<work_id>\d+)/merge/$', views.merge_work, name='moderation-work-merge'),
    url(r'^works/(?P<work_id>\d+)/mappings/$', views.add_mapping, name='moderation-work-mappings'),
    url(r'^mappings/(?P<mapping_id>\d+)/set_primary_title/$',
     views.set_primary_title, name='moderation-mapping-set-primary-title'),
    url(r'^mappings/(?P<mapping_id>\d+)/delete/$', views.delete_mapping, name='moderation-mapping-delete'),
]
