# -*- coding: utf-8 -*-
from django.db import transaction
from django.shortcuts import get_object_or_404
from api.v2 import BaseView
from api.serializers import serialize_record, serialize_post
from record.models import History


class PostView(BaseView):
    def get(self, request, id):
        post = get_object_or_404(History, id=id)
        return serialize_post(post, include_record=True, include_user=True)

    @transaction.atomic
    def delete(self, request, id):
        history = get_object_or_404(History, id=id)
        self.check_login()
        if request.user.id != history.user_id:
            self.raise_error('Permission denied.', status=403)
        if history.record.history_set.count() == 1:
            # 422 Unprocessable Entity
            self.raise_error(u'등록된 작품마다 최소 1개의 기록이 필요합니다.', status=422)
        history.delete()
        latest_history = history.record.history_set.latest()
        history.record.status = latest_history.status
        history.record.status_type = latest_history.status_type
        history.record.save()
        return {
            'record': serialize_record(history.record)
        }
