# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth.models import User
from api.v2 import BaseView
from api.serializers import serialize_record, serialize_post
from work.models import get_or_create_work
from record.models import Record, History, StatusTypes


class UserRecordsView(BaseView):
    def get(self, request, name):
        user = get_object_or_404(User, username=name)
        include_has_newer_episode = \
            request.GET.get('include_has_newer_episode') == 'true'
        if request.user != user:
            include_has_newer_episode = False
        records = user.record_set.all()
        sort = request.GET.get('sort')
        if sort == 'date':
            records = records.order_by('-updated_at')
        elif sort == 'title':
            records = records.order_by('title')
        status_type = request.GET.get('status_type')
        if status_type:
            records = records.filter(status_type=StatusTypes.from_name(status_type))
        limit = request.GET.get('limit')
        if limit:
            try:
                limit = int(limit)
                records = records[:limit]
            except ValueError:
                pass
        return [serialize_record(
            record,
            include_has_newer_episode=include_has_newer_episode
        ) for record in records]

    @transaction.atomic
    def post(self, request, name):
        self.check_login()
        if request.user.username != name:
            self.raise_error('Permission denied.', status=403)
        title = request.POST.get('work_title')
        if not title:
            # 400 Bad Request
            self.raise_error(u'작품 제목을 입력하세요.', status=400)
        work = get_or_create_work(title)
        category_id = request.POST.get('category_id')
        if category_id:
            # TODO: Raise appropriate exception if not exist/no permission
            category = request.user.category_set.get(id=category_id)
        else:
            category = None
        try:
            record = Record.objects.get(user=request.user, work=work)
            # 422 Unprocessable Entity
            self.raise_error(
                u'이미 같은 작품이 "%s"로 등록되어 있습니다.' % record.title,
                status=422
            )
        except Record.DoesNotExist:
            record = Record.objects.create(
                user=request.user,
                work=work,
                title=title,
                category=category,
            )
        history = History.objects.create(
            user=request.user,
            work=record.work,
            status='',
            status_type=StatusTypes.from_name(request.POST['status_type']),
        )
        # Sync fields
        record.status = history.status
        record.status_type = history.status_type
        record.updated_at = history.updated_at
        return {
            'record': serialize_record(record),
            'post': serialize_post(history),
        }
