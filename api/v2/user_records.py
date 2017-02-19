# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth.models import User
from api.v2 import BaseView
from api.serializers import serialize_record, serialize_post
from api.services import user_records
from work.models import get_or_create_work
from record.models import Record, History, StatusType


class UserRecordsView(BaseView):
    def get(self, request, name):
        user = get_object_or_404(User, username=name)
        include_has_newer_episode = \
            request.GET.get('include_has_newer_episode') == 'true'
        if request.user != user:
            include_has_newer_episode = False

        record_filter = self._build_record_filter(request)
        queryset = user.record_set.all()
        if record_filter.status_type_set:
            queryset = queryset.filter(status_type=record_filter.status_type)
        if record_filter.category_id_set:
            queryset = queryset.filter(category_id=record_filter.category_id)

        records = queryset
        sort = request.GET.get('sort', 'date')
        if sort == 'date':
            records = records.order_by('-updated_at')
        elif sort == 'title':
            records = records.order_by('title')
        limit = request.GET.get('limit')
        if limit:
            try:
                limit = int(limit)
                records = records[:limit]
            except ValueError:
                pass
        data = [serialize_record(
            record,
            include_has_newer_episode=include_has_newer_episode
        ) for record in records]

        with_counts = request.GET.get('with_counts') == 'true'
        if not with_counts:
            return data

        return {
            'counts': user_records.count(user, record_filter),
            'data': data,
        }

    def _build_record_filter(self, request):
        status_type = request.GET.get('status_type')
        if status_type:
            status_type = StatusType[status_type]
        else:
            status_type = None

        category_id = request.GET.get('category_id')
        if category_id:
            category_id_set = True
            category_id = int(category_id)
            if category_id == 0:
                category_id = None
        else:
            category_id_set = False
            category_id = None

        return user_records.RecordFilter(status_type, category_id, category_id_set)

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
            pass

        record = Record.objects.create(
            user=request.user,
            work=work,
            title=title,
            category=category,
            status='',
            status_type=StatusType[request.POST['status_type']],
        )
        history = History.objects.create(
            user=request.user,
            work=record.work,
            record=record,
            status=record.status,
            status_type=record.status_type,
            updated_at=record.updated_at
        )
        return {
            'record': serialize_record(record),
            'post': serialize_post(history),
        }
