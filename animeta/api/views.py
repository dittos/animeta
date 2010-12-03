import json
import functools
import pytz
from cStringIO import StringIO
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Count
from record.models import History, StatusTypes
from record.templatetags.status import status_text

def json_response(view):
	@functools.wraps(view)
	def wrapper(*args, **kwargs):
		response = HttpResponse(mimetype='application/json')
		json.dump(view(*args, **kwargs), response)
		return response
	return wrapper

def _serialize_datetime(dt):
	return pytz.timezone(settings.TIME_ZONE).localize(dt).isoformat()

def _serialize_status(history):
	return {'type': history.status_type_name, 'text': status_text(history), 'raw_text': history.status}

def _history_as_dict(history):
	return {
		'id': history.id,
		'user': history.user.username,
		'work': {'title': history.work.title, 'id': history.work.id},
		'status': _serialize_status(history),
		'comment': history.comment,
		'updated_at': _serialize_datetime(history.updated_at)
	}

@json_response
def get_records(request):
	queryset = History.objects.order_by('-id')
	if 'user_name' in request.GET:
		queryset = queryset.filter(user__username=request.GET['user_name'])
	if 'work_id' in request.GET:
		queryset = queryset.filter(work__id=request.GET['work_id'])
	if request.GET.get('only_commented', '') == 'true':
		queryset = queryset.exclude(comment='')

	count = min(int(request.GET.get('count', 20)), 100)
	queryset = queryset[:count]

	return [_history_as_dict(h) for h in queryset]

@json_response
def get_record(request, id):
	history = get_object_or_404(History, id=id)
	result = _history_as_dict(history)
	if request.GET.get('include_related', 'true') == 'true':
		result['related'] = [_history_as_dict(h) for h in History.objects.filter(work=history.work, status=history.status).exclude(user=history.user)]
	return result

@json_response
def get_user(request, name):
	user = get_object_or_404(User, username=name)
	stats = {'total': user.record_set.count()}
	for name in StatusTypes.names:
		stats[name] = 0
	for d in user.record_set.values('status_type').annotate(count=Count('status_type')).order_by():
		stats[StatusTypes.to_name(d['status_type'])] = d['count']

	result = {
		'name': user.username,
		'joined_at': _serialize_datetime(user.date_joined),
		'stats': stats,
	}
	if request.GET.get('include_library_items', 'true') == 'true':
		result['library_items'] = [{
			'id': record.work.id,
			'title': record.work.title,
			'status': _serialize_status(record),
		} for record in user.record_set.all()]
	return result
