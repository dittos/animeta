# -*- coding: utf-8 -*-
import time
from connect import get_connected_services

def serialize_datetime(dt):
    if dt is None:
        return None
    return int((time.mktime(dt.timetuple()) + dt.microsecond / 1000000.0) * 1000)

def serialize_user(user, viewer=None, include_categories=True):
    data = {
        'id': user.id,
        'name': user.username,
        'date_joined': serialize_datetime(user.date_joined),
    }
    if viewer == user:
        data['connected_services'] = get_connected_services(user)
    if include_categories:
        data['categories'] = map(serialize_category, user.category_set.all())
    return data

def serialize_category(category):
    return {
        'id': category.id,
        'name': category.name,
    }

def serialize_record(record, include_has_newer_episode=False):
    data = {
        'id': record.id,
        'user_id': record.user_id,
        'work_id': record.work_id,
        'category_id': record.category_id,
        'title': record.title,
        'status': record.status,
        'status_type': record.status_type.name,
        'updated_at': serialize_datetime(record.updated_at),
    }
    if include_has_newer_episode and record.has_newer_episode():
        data['has_newer_episode'] = True
    return data

def serialize_post(post, include_record=False):
    data = {
        'id': post.id,
        'record_id': post.record.id,
        'status': post.status,
        'status_type': post.status_type.name,
        'comment': post.comment,
        'updated_at': serialize_datetime(post.updated_at),
    }
    if include_record:
        data['record'] = serialize_record(post.record)
    return data
