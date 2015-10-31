# -*- coding: utf-8 -*-
from django.db import transaction
from django.shortcuts import get_object_or_404
from api.v2 import BaseView
from api.serializers import serialize_record
from record.models import Record

class RecordView(BaseView):
    def get(self, request, id):
        record = get_object_or_404(Record, id=id)
        return serialize_record(record, include_user=True)

    @transaction.atomic
    def post(self, request, id):
        record = get_object_or_404(Record, id=id)
        self.check_login()
        if request.user.id != record.user_id:
            self.raise_error('Permission denied.', status=403)
        title = request.POST.get('title')
        if title:
            try:
                with transaction.atomic():
                    record.update_title(title)
            except:
                self.raise_error(u'이미 같은 작품이 등록되어 있어 제목을 바꾸지 못했습니다.',
                    status=422) # 422 Unprocessable Entity

        if 'category_id' in request.POST:
            category_id = request.POST.get('category_id')
            if category_id:
                record.category = request.user.category_set.get(id=category_id)
            else:
                record.category = None
            record.save()

        return serialize_record(record)

    def delete(self, request, id):
        record = get_object_or_404(Record, id=id)
        self.check_login()
        if request.user.id != record.user_id:
            self.raise_error('Permission denied.', status=403)
        record.delete()
        return {'ok': True}
