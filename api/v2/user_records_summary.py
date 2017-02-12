# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404
from django.db import models
from django.contrib.auth.models import User
from api.v2 import BaseView
from record.models import StatusType


class UserRecordsSummaryView(BaseView):
    def get(self, request, name):
        user = get_object_or_404(User, username=name)
        count = user.record_set.count()
        count_by_status_type = {
            StatusType(row['status_type']).name: row['id__count']
            for row in user.record_set.values('status_type')
                .annotate(models.Count('id'))
        }
        for status_type in StatusType:
            if status_type.name not in count_by_status_type:
                count_by_status_type[status_type.name] = 0
        count_by_category = {
            row['id']: row['record__count']
            for row in user.category_set.values('id')
                .annotate(models.Count('record'))
        }
        count_by_category['0'] = user.record_set.filter(category=None).count()
        return {
            'count': count,
            'count_by_status_type': count_by_status_type,
            'count_by_category': count_by_category,
        }
