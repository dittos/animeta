# -*- coding: utf-8 -*-
from django.db import transaction
from django.shortcuts import get_object_or_404
from api.v2 import BaseView
from api.serializers import serialize_record, serialize_post
from connect.twitter import post_history_to_twitter
from record.models import Record, History, StatusType


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

        with transaction.atomic():
            history = History.objects.create(
                user=request.user,
                work=record.work,
                record=record,
                status=request.POST['status'],
                status_type=StatusType[request.POST['status_type']],
                comment=request.POST['comment'],
                contains_spoiler=request.POST.get('contains_spoiler') == 'true',
            )
            record.status_type = history.status_type
            record.status = history.status
            record.updated_at = history.updated_at
            record.save()

        if request.POST.get('publish_twitter') == 'on':
            post_history_to_twitter(request.user, history)

        return {
            'record': serialize_record(record),
            'post': serialize_post(history),
        }
