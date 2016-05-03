import datetime
import simplejson
from django.contrib.auth.models import User
from django.http import HttpResponse

from api import serializers
from connect.models import TwitterSetting
from record.models import Record, Category, History


class NodeType(object):
    def __init__(self, model, serializer):
        self.model = model
        self.serializer = serializer


def make_serializer(fields, aliases=None, edges=None):
    if aliases is None:
        aliases = {}
    if edges is None:
        edges = {}

    def _serializer(obj, request):
        data = {}
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
    serializer = make_serializer(['title', 'status', 'updated_at'],
                                 edges={'user_id': 'User', 'work_id': 'Work', 'category_id': 'Category'})

    def _serializer(obj, request):
        data = serializer(obj, request)
        data['status_type'] = obj.status_type.name
        return data

    return _serializer


def make_post_serializer():
    serializer = make_serializer(['status', 'comment', 'updated_at', 'contains_spoiler'])

    def _serializer(obj, request):
        data = serializer(obj, request)
        data['status_type'] = obj.status_type.name
        data['record_id'] = 'Record:' + str(obj.record.id)
        return data

    return _serializer


resolvers = {}

node_types = {
    'User': NodeType(User, make_serializer(['name', 'date_joined'], aliases={'name': 'username'})),
    'Record': NodeType(Record, make_record_serializer()),
    'Category': NodeType(Category, make_serializer(['name'], edges={'user_id': 'User'})),
    'Post': NodeType(History, make_post_serializer()),
}
for name, node_type in node_types.items():
    node_type.name = name

field_resolvers = {}
root_resolvers = {}


def _get_user_categories(user_id, args, request):
    result = []
    for category in Category.objects.filter(user_id=user_id):
        result.append(_make_node_result(node_types['Category'], category, request))
    return result

field_resolvers[('User', 'categories')] = _get_user_categories


def _get_user_connected_services(user_id, args, request):
    if not request.user.is_authenticated():
        return None
    try:
        TwitterSetting.objects.get(user_id=user_id)
    except TwitterSetting.DoesNotExist:
        return []
    return ['twitter']

field_resolvers[('User', 'connected_services')] = _get_user_connected_services


def _get_user_records(user_id, args, request):
    record_type = node_types['Record']
    return {
        'edges': [{
            'node': _make_node_result(record_type, node, request),
            'cursor': str(node.id),
        } for node in Record.objects.filter(user_id=user_id)],
        'pageInfo': {
            'hasPreviousPage': False,
            'hasNextPage': False
        }
    }

field_resolvers[('User', 'records')] = _get_user_records


def _get_record_posts(record_id, args, request):
    record = Record.objects.get(pk=record_id)
    post_type = node_types['Post']
    return {
        'edges': [{
            'node': _make_node_result(post_type, node, request),
            'cursor': str(node.id),
        } for node in record.history_set],
        'pageInfo': {
            'hasPreviousPage': False,
            'hasNextPage': False
        }
    }

field_resolvers[('Record', 'posts')] = _get_record_posts


def batch_call(request):
    queries = simplejson.load(request)
    results = []
    for query in queries:
        results.append(resolvers[query['type']](request, query))
    return HttpResponse(
        simplejson.dumps(results),
        content_type='application/json'
    )


def get_node(request, query):
    typename, id = _parse_node_id(query['id'])
    node_type = node_types[typename]
    try:
        node = node_type.model.objects.get(pk=id)
    except node_type.model.DoesNotExist:
        return None
    return _make_node_result(node_type, node, request)

resolvers['node'] = get_node


def get_field(request, query):
    typename, id = _parse_node_id(query['id'])
    field_resolver = field_resolvers[(typename, query['field'])]
    args = query.get('args')
    return field_resolver(id, args, request)

resolvers['field'] = get_field


def get_root(request, query):
    root_resolver = root_resolvers[query['field']]
    args = query.get('args')
    return root_resolver(args, request)

resolvers['root'] = get_root


def get_user_by_name(args, request):
    user = User.objects.get(username=args['name'])
    return _make_node_result(node_types['User'], user, request)

root_resolvers['user'] = get_user_by_name


def get_viewer(args, request):
    if not request.user.is_authenticated():
        return None
    return _make_node_result(node_types['User'], request.user, request)

root_resolvers['viewer'] = get_viewer


def _parse_node_id(node_id):
    typename, id = node_id.split(':', 1)
    return typename, id


def _make_node_result(node_type, node, request):
    result = node_type.serializer(node, request)
    result['__typename'] = node_type.name
    result['id'] = '{}:{}'.format(node_type.name, node.id)
    result['simple_id'] = node.id
    return result
