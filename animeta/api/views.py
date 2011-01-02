import pytz
from cStringIO import StringIO
from django.shortcuts import get_object_or_404, render_to_response
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Count
from oauth_provider.decorators import oauth_required
from api.decorators import json_response
from work.models import Work
from record.models import History, StatusTypes
from record.templatetags.status import status_text

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
		'updated_at': _serialize_datetime(history.updated_at),
		'url': 'http://animeta.net/-%d' % history.id
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
	for t in StatusTypes.types:
		stats[t.name] = 0
	for d in user.record_set.values('status_type').annotate(count=Count('status_type')).order_by():
		stats[StatusTypes.to_name(d['status_type'])] = d['count']

	categories = []
	for d in user.record_set.values('category__name').annotate(count=Count('category')).order_by():
		categories.append({'name': d['category__name'], 'count': d['count']})

	result = {
		'name': user.username,
		'joined_at': _serialize_datetime(user.date_joined),
		'stats': stats,
		'categories': categories,
	}
	if request.GET.get('include_library_items', 'true') == 'true':
		result['library_items'] = [{
			'id': record.work.id,
			'title': record.work.title,
			'status': _serialize_status(record),
			'category': getattr(record.category, 'name', ""),
		} for record in user.record_set.all()]
	return result

def _work_as_dict(work, include_watchers=False):
	watchers = {'total': work.popularity}
	if include_watchers:
		for t in StatusTypes.types:
			watchers[t.name] = []
		for record in work.record_set.order_by('status_type', 'user__username'):
			watchers[StatusTypes.to_name(record.status_type)].append(record.user.username)
	else:
		for t in StatusTypes.types:
			watchers[t.name] = 0
		for d in work.record_set.values('status_type').annotate(count=Count('status_type')).order_by():
			watchers[StatusTypes.to_name(d['status_type'])] = d['count']

	return {
		'id': work.id,
		'title': work.title,
		'rank': work.rank,
		'watchers': watchers,
	}

@json_response
def get_works(request):
	count = min(int(request.GET.get('count', 20)), 100)
	keyword = request.GET.get('keyword', '')
	match = request.GET.get('match', 'contains')
	sort = request.GET.get('sort', 'popular')

	queryset = Work.objects.all()

	if keyword.strip():
		if match == 'exact':
			queryset = queryset.filter(title__iexact=keyword)
		elif match == 'prefix':
			queryset = queryset.filter(title__istartswith=keyword)
		elif match == 'similar':
			queryset = queryset.extra(select={'dist': 'title_distance(%s, title)'}, select_params=[keyword])
		else: #match == 'contains'
			queryset = queryset.filter(title__icontains=keyword)

	if sort == 'title':
		queryset = queryset.order_by('title')
	elif sort == 'relevance' and match == 'similar':
		queryset = queryset.extra(order_by=['dist'])
	else: #sort == 'popular'
		queryset = queryset.annotate(factor=Count('record', distinct=True)).exclude(factor=0).order_by('-factor', 'title')

	return [_work_as_dict(work) for work in queryset[:count]]

@json_response
def get_work(request, id):
	work = get_object_or_404(Work, id=id)
	return _work_as_dict(work, request.GET.get('include_watchers', 'false') == 'true')

@oauth_required
@json_response
def nop(request):
	return request.user.username == request.GET.get('username', '')
