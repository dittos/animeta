import json
import functools
from cStringIO import StringIO
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from record.models import History
from record.templatetags.status import status_text

def json_response(view):
	@functools.wraps(view)
	def wrapper(*args, **kwargs):
		response = HttpResponse(mimetype='application/json')
		json.dump(view(*args, **kwargs), response)
		return response
	return wrapper

def _history_as_dict(history):
	return {
		'id': history.id,
		'user': history.user.username,
		'work': {'title': history.work.title, 'id': history.work.id},
		'status': {'type': history.status_type_name, 'text': status_text(history), 'raw_text': history.status},
		'comment': history.comment,
		'updated_at': history.updated_at.strftime('%Y-%m-%d %H:%M:%S')
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
	result['related'] = [_history_as_dict(h) for h in History.objects.filter(work=history.work, status=history.status).exclude(user=history.user)]
	return result
