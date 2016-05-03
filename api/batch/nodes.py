import datetime
from django.contrib.auth.models import User

from api import serializers
from record.models import Record, Category, History


class NodeType(object):
    def __init__(self, model, serializer):
        self.model = model
        self.serializer = serializer

    def serialize(self, obj, request):
        return self.serializer(obj, request)


def make_serializer(type_name, fields, aliases=None, edges=None):
    if aliases is None:
        aliases = {}
    if edges is None:
        edges = {}

    def _serializer(obj, request):
        data = {
            '__typename': type_name,
            'id': '{}:{}'.format(type_name, obj.id),
            'simple_id': obj.id,
        }
        for field in fields:
            value = getattr(obj, aliases.get(field, field))
            if isinstance(value, datetime.datetime):
                value = serializers.serialize_datetime(value)
            data[field] = value
        for field, typename in edges.items():
            simple_id = getattr(obj, field)
            if simple_id is not None:
                data[field] = typename + ':' + str(simple_id)
        return data

    return _serializer


def make_record_serializer():
    serializer = make_serializer('Record', ['title', 'status', 'updated_at'],
                                 edges={'user_id': 'User', 'work_id': 'Work', 'category_id': 'Category'})

    def _serializer(obj, request):
        data = serializer(obj, request)
        data['status_type'] = obj.status_type.name
        return data

    return _serializer


def make_post_serializer():
    serializer = make_serializer('Post', ['status', 'comment', 'updated_at', 'contains_spoiler'])

    def _serializer(obj, request):
        data = serializer(obj, request)
        data['status_type'] = obj.status_type.name
        data['record_id'] = 'Record:' + str(obj.record.id)
        return data

    return _serializer


UserNode = NodeType(User, make_serializer('User', ['name', 'date_joined'], aliases={'name': 'username'}))
RecordNode = NodeType(Record, make_record_serializer())
CategoryNode = NodeType(Category, make_serializer('Category', ['name'], edges={'user_id': 'User'}))
PostNode = NodeType(History, make_post_serializer())
