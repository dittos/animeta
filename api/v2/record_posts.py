# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404
from api.v2 import BaseView
from api.serializers import serialize_record, serialize_post
from record.models import Record, History, StatusTypes
from connect import post_history


class RecordPostsView(BaseView):
    def get(self, request, id):
        record = get_object_or_404(Record, id=id)
        posts = record.history_set
        return {
            'posts': map(serialize_post, posts)
        }

    def post(self, request, id):
        record = get_object_or_404(Record, id=id)
        self.check_login()
        if request.user.id != record.user_id:
            self.raise_error('Permission denied.', status=403)
        history = History.objects.create(
            user=request.user,
            work=record.work,
            status=request.POST['status'],
            status_type=StatusTypes.from_name(request.POST['status_type']),
            comment=request.POST['comment'],
        )

        services = []
        if request.POST.get('publish_twitter') == 'on':
            services.append('twitter')

        post_history(history, services)

        return {
            'record': serialize_record(history.record),
            'post': serialize_post(history),
        }
