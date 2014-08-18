# -*- coding: utf-8 -*-
import calendar
import json
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.views.generic import View
from record.models import Record

def serialize_datetime(dt):
    return int((calendar.timegm(dt.utctimetuple()) + dt.microsecond / 1000000.0) * 1000)

def serialize_record(record):
    return {
        'id': record.id,
        'user_id': record.user_id,
        'work_id': record.work_id,
        'category_id': record.category_id,
        'title': record.title,
        'status': record.status,
        'status_type': record.status_type.name,
        'updated_at': serialize_datetime(record.updated_at),
    }

def render_json(obj, **kwargs):
    return HttpResponse(json.dumps(obj), content_type='application/json', **kwargs)

class RecordView(View):
    def get(self, request, id):
        record = get_object_or_404(Record, id=id)
        return render_json(serialize_record(record))

    def post(self, request, id):
        if not request.user.is_authenticated():
            return render_json({'message': 'Login required.'}, status=401)
        record = get_object_or_404(Record, id=id)
        if request.user.id != record.user_id:
            return render_json({'message': 'Permission denied.'}, status=403)

        title = request.POST.get('title')
        if title:
            try:
                record.update_title(title)
            except:
                transaction.rollback()
                return render_json(
                    {'message': u'이미 같은 작품이 등록되어 있어 제목을 바꾸지 못했습니다.'},
                    status=422 # 422 Unprocessable Entity
                )

        if 'category_id' in request.POST:
            category_id = request.POST.get('category_id')
            if category_id:
                record.category = request.user.category_set.get(id=category_id)
            else:
                record.category = None
            record.save()

        return render_json(serialize_record(record))
