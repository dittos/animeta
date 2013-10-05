from django.conf.urls import patterns
from moderation.views import MergeDashboardView

urlpatterns = patterns('moderation.views',
    (r'^merge/$', MergeDashboardView.as_view()),
)
