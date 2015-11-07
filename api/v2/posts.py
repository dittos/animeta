# -*- coding: utf-8 -*-
from api.v2 import BaseView
from api.serializers import serialize_post
from record.models import History


class PostsView(BaseView):
    def get(self, request):
        queryset = (History.objects
                    .select_related('user', 'work')
                    .exclude(comment='')
                    .order_by('-id'))
        if 'before_id' in request.GET:
            queryset = queryset.filter(id__lt=request.GET['before_id'])
        if 'min_record_count' in request.GET:
            queryset = queryset.filter(
                work__index__record_count__gte=request.GET['min_record_count']
            )
        count = min(int(request.GET.get('count', 32)), 128)
        return [
            serialize_post(post, include_record=True, include_user=True)
            for post in queryset[:count]
        ]
