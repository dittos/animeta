# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404
from api.v2 import BaseView
from api.serializers import serialize_record, serialize_post
from connect.twitter import post_history_to_twitter
from record.models import Record, History, StatusTypes


class RecordPostsView(BaseView):
    def get(self, request, id):
        record = get_object_or_404(Record, id=id)
        posts = record.history_set.all()
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
            record=record,
            status=request.POST['status'],
            status_type=StatusTypes.from_name(request.POST['status_type']),
            comment=request.POST['comment'],
            contains_spoiler=request.POST.get('contains_spoiler') == 'true',
        )

        if request.POST.get('publish_twitter') == 'on':
            post_history_to_twitter(request.user, history)

        return {
            'record': serialize_record(history.record),
            'post': serialize_post(history),
        }
