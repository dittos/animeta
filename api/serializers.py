# -*- coding: utf-8 -*-
import time
from connect import get_connected_services
from work.models import TitleMapping
from record.models import get_episodes, Record
from search.models import WorkIndex
from table.models import item_json, Period

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

def serialize_post(post, include_record=False, include_user=False):
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
    if include_user:
        data['user'] = serialize_user(post.user, include_categories=False)
    return data

def serialize_work(work, viewer=None, full=False):
    data = {
        'id': work.id,
        'title': work.title,
    }
    if full:
        data['alt_titles'] = list(TitleMapping.objects.filter(work=work) \
                                  .exclude(title=work.title).values_list('title', flat=True))
        data['episodes'] = get_episodes(work)
    try:
        data['record_count'] = work.index.record_count
        data['rank'] = work.index.rank
    except WorkIndex.DoesNotExist:
        data['record_count'] = work.record_set.count()
    if viewer and viewer.is_authenticated():
        try:
            data['record'] = serialize_record(viewer.record_set.get(work=work))
        except Record.DoesNotExist:
            pass
    metadata = work.metadata
    if metadata:
        period = Period.parse(metadata['periods'][0])
        data['metadata'] = item_json(metadata, period)
    return data
