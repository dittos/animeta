# -*- coding: utf-8 -*-
from django.http import QueryDict
from api.v2 import BaseView
from api.serializers import serialize_category
from record.models import Category, Record

class UserCategoriesView(BaseView):
    def post(self, request, name):
        self.check_login()
        if request.user.username != name:
            self.raise_error('Permission denied.', status=403)
        category_name = request.POST.get('name')
        if not category_name:
            self.raise_error(u'분류 이름을 입력하세요.',
                status=400) # 400 Bad Request
        category = Category.objects.create(
            user=request.user,
            name=category_name
        )
        record_ids = request.POST.getlist('record_ids[]')
        Record.objects.filter(user=request.user, id__in=record_ids) \
            .update(category=category)
        return serialize_category(category)

    def put(self, request, name):
        self.check_login()
        if request.user.username != name:
            self.raise_error('Permission denied.', status=403)
        # Django doesn't parse request body in PUT request
        # See: http://stackoverflow.com/a/22294734
        params = QueryDict(request.body)
        ids = params.getlist('ids[]')
        category_ids = [c.id for c in request.user.category_set.all()]
        if len(ids) != len(category_ids) and \
            set(ids) != set(category_ids):
            self.raise_error(u'분류 정보가 최신이 아닙니다. 새로고침 후 다시 시도해주세요.',
                status=409) # 409 Conflict
        for position, id in enumerate(ids):
            request.user.category_set.filter(id=int(id)) \
                .update(position=position)
        return map(serialize_category, request.user.category_set.all())
