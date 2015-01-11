from django.conf.urls import patterns
from moderation.views import MergeDashboardView

urlpatterns = patterns('moderation.views',
    (r'^$', 'index'),
    (r'^works/$', 'create_work'),
    (r'^works/(?P<work_id>\d+)/$', 'work_detail'),
    (r'^works/(?P<work_id>\d+)/metadata/$', 'edit_metadata'),
    (r'^works/(?P<work_id>\d+)/delete/$', 'delete_work'),
    (r'^works/(?P<work_id>\d+)/merge/$', 'merge_work'),
    (r'^works/(?P<work_id>\d+)/mappings/$', 'add_mapping'),
    (r'^mappings/(?P<mapping_id>\d+)/set_primary_title/$', 'set_primary_title'),
    (r'^mappings/(?P<mapping_id>\d+)/delete/$', 'delete_mapping'),
    (r'^merge/$', MergeDashboardView.as_view()),
)
