import simplejson
from django.contrib.auth.models import User
from django.http import HttpResponse

from connect.models import TwitterSetting
from record.models import Record, Category
from . import nodes

node_types = {
    'User': nodes.UserNode,
    'Record': nodes.RecordNode,
    'Category': nodes.CategoryNode,
    'Post': nodes.PostNode,
}
resolvers = {}
field_resolvers = {}
root_resolvers = {}


def _get_user_categories(user_id, args, request):
    result = []
    for category in Category.objects.filter(user_id=user_id):
        result.append(nodes.CategoryNode.serialize(category, request))
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
    return {
        'edges': [{
            'node': nodes.RecordNode.serialize(node, request),
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
    return {
        'edges': [{
            'node': nodes.PostNode.serialize(node, request),
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
    return node_type.serialize(node, request)

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
    return nodes.UserNode.serialize(user, request)

root_resolvers['user'] = get_user_by_name


def get_viewer(args, request):
    if not request.user.is_authenticated():
        return None
    return nodes.UserNode.serialize(request.user, request)

root_resolvers['viewer'] = get_viewer


def _parse_node_id(node_id):
    typename, id = node_id.split(':', 1)
    return typename, id
