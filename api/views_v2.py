# -*- coding: utf-8 -*-
import time
import json
from django.db import transaction
from django.shortcuts import get_object_or_404, redirect
from django.http import HttpResponse
from django.views.generic import View
from django.contrib.auth.models import User
from connect import get_connected_services
from record.models import Record, History, StatusTypes, Uncategorized

def serialize_datetime(dt):
    return int((time.mktime(dt.timetuple()) + dt.microsecond / 1000000.0) * 1000)

def serialize_user(user):
    return {
        'id': user.id,
        'name': user.username,
        'date_joined': serialize_datetime(user.date_joined),
        'connected_services': get_connected_services(user),
    }

def serialize_category(category):
    return {
        'id': category.id,
        'name': category.name,
    }

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

def serialize_post(post):
    return {
        'id': post.id,
        'record_id': post.record.id,
        'status': post.status,
        'status_type': post.status_type.name,
        'comment': post.comment,
        'updated_at': serialize_datetime(post.updated_at),
    }

def render_json(obj, **kwargs):
    return HttpResponse(json.dumps(obj), content_type='application/json', **kwargs)

def check_login(user):
    if not user.is_authenticated():
        raise HttpException(render_json({'message': 'Login required.'}, status=401))

def check_record_owner(user, record):
    check_login(user)
    if user.id != record.user_id:
        raise HttpException(render_json({'message': 'Permission denied.'}, status=403))

class HttpException(Exception):
    def __init__(self, response):
        self.response = response

class BaseView(View):
    def dispatch(self, request, *args, **kwargs):
        try:
            return render_json(super(BaseView, self).dispatch(request, *args, **kwargs))
        except HttpException as e:
            return e.response

def get_current_user(request, remainder):
    check_login(request.user)
    return redirect('/api/v2/users/%s%s' % (request.user.username, remainder or ''))

class UserView(BaseView):
    def get(self, request, name):
        user = get_object_or_404(User, username=name)
        uncategorized = Uncategorized(user)
        categories = [uncategorized] + list(user.category_set.all())
        return {
            'user': serialize_user(user),
            'categories': map(serialize_category, categories),
        }

class UserRecordsView(BaseView):
    def get(self, request, name):
        user = get_object_or_404(User, username=name)
        return map(serialize_record, user.record_set.all())

class RecordView(BaseView):
    def get(self, request, id):
        record = get_object_or_404(Record, id=id)
        return serialize_record(record)

    def post(self, request, id):
        record = get_object_or_404(Record, id=id)
        check_record_owner(request.user, record)
        title = request.POST.get('title')
        if title:
            try:
                record.update_title(title)
            except:
                transaction.rollback()
                raise HttpException(render_json(
                    {'message': u'이미 같은 작품이 등록되어 있어 제목을 바꾸지 못했습니다.'},
                    status=422 # 422 Unprocessable Entity
                ))

        if 'category_id' in request.POST:
            category_id = request.POST.get('category_id')
            if category_id:
                record.category = request.user.category_set.get(id=category_id)
            else:
                record.category = None
            record.save()

        return serialize_record(record)

class RecordPostsView(BaseView):
    def get(self, request, id):
        record = get_object_or_404(Record, id=id)
        posts = record.history_set
        return {
            'posts': map(serialize_post, posts)
        }

    def post(self, request, id):
        record = get_object_or_404(Record, id=id)
        check_record_owner(request.user, record)
        history = History.objects.create(
            user=request.user,
            work=record.work,
            status=request.POST['status'],
            status_type=StatusTypes.from_name(request.POST['status_type']),
            comment=request.POST['comment'],
        )
        return {
            'record': serialize_record(history.record),
            'post': serialize_post(history),
        }
