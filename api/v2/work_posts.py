from django.shortcuts import get_object_or_404
from api.v2 import BaseView
from api.serializers import serialize_post
from work.models import Work


class WorkPostsView(BaseView):
    def get(self, request, id):
        work = get_object_or_404(Work, id=id)
        queryset = work.history_set.exclude(comment='').order_by('-id')
        if 'before_id' in request.GET:
            queryset = queryset.filter(id__lt=request.GET['before_id'])
        if 'episode' in request.GET:
            queryset = queryset.filter(status=request.GET['episode'])
        count = min(int(request.GET.get('count', 32)), 128)
        return [
            serialize_post(post, include_user=True)
            for post in queryset[:count]
        ]
