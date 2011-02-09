import pytz
from cStringIO import StringIO
from django.http import Http404
from django.shortcuts import get_object_or_404, render_to_response
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Count
from oauth_provider.decorators import oauth_required
from api.decorators import api_response
from work.models import Work
from record.models import History, StatusTypes
from record.templatetags.status import status_text
from chart.models import PopularWorksChart, ActiveUsersChart, compare_charts
from chart.utils import Week, Month

def _serialize_datetime(dt):
	return pytz.timezone(settings.TIME_ZONE).localize(dt)

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

@api_response
def get_records(request):
	queryset = History.objects.order_by('-id')
	if 'user_name' in request.GET:
		queryset = queryset.filter(user__username=request.GET['user_name'])
	if 'work_id' in request.GET:
		queryset = queryset.filter(work__id=request.GET['work_id'])
	if 'before' in request.GET:
		queryset = queryset.filter(id__lt=int(request.GET['before']))
	if request.GET.get('only_commented', '') == 'true':
		queryset = queryset.exclude(comment='')

	count = min(int(request.GET.get('count', 20)), 100)
	queryset = queryset[:count]

	return [_history_as_dict(h) for h in queryset]

@api_response
def get_record(request, id):
	history = get_object_or_404(History, id=id)
	result = _history_as_dict(history)
	if request.GET.get('include_related', 'true') == 'true':
		result['related'] = [_history_as_dict(h) for h in History.objects.filter(work=history.work, status=history.status).exclude(user=history.user)]
	return result

@oauth_required
@api_response
def delete_record(request, id):
	history = get_object_or_404(History, id=id)
	if history.user != request.user:
		return {'error': "It's not your record", 'error_code': 403}
	history.delete()
	if history.record.history_set.count() == 0:
		history.record.delete()
	return True

@api_response
def get_user(request, name):
	user = get_object_or_404(User, username=name)

	stats = {'total': user.record_set.count()}
	for t in StatusTypes.types:
		stats[t.name] = 0
	for d in user.record_set.values('status_type').annotate(count=Count('status_type')).order_by():
		stats[StatusTypes.to_name(d['status_type'])] = d['count']

	categories = []
	for d in user.record_set.values('category__name').annotate(count=Count('category')).order_by():
		categories.append({'name': d['category__name'] or "", 'count': d['count']})

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
			'updated_at': _serialize_datetime(record.updated_at),
		} for record in user.record_set.order_by('work__title')]
	return result

@oauth_required
def get_current_user(request):
	return get_user(request, request.user.username)

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

@api_response
def get_works(request):
	count = min(int(request.GET.get('count', 20)), 100)
	keyword = request.GET.get('keyword', '')
	match = request.GET.get('match', 'contains')
	sort = request.GET.get('sort', 'popular')

	queryset = Work.objects.all()

	if keyword.strip():
		if match == 'prefix':
			queryset = queryset.filter(title__istartswith=keyword)
		elif match == 'similar':
			queryset = queryset.extra(select={'dist': 'title_distance(%s, title)'}, select_params=[keyword])
		else: #match == 'contains'
			queryset = queryset.filter(title__icontains=keyword)

	if match == 'similar':
		queryset = queryset.extra(order_by=['dist'])
	else:
		if sort == 'title':
			queryset = queryset.order_by('title')
		else: #sort == 'popular'
			queryset = queryset.annotate(factor=Count('record', distinct=True)).exclude(factor=0).order_by('-factor', 'title')

	return [_work_as_dict(work) for work in queryset[:count]]

@api_response
def get_work(request, id):
	work = get_object_or_404(Work, id=id)
	return _work_as_dict(work, request.GET.get('include_watchers', 'false') == 'true')

@api_response
def get_work_by_title(request, title):
	work = get_object_or_404(Work, title=title)
	return _work_as_dict(work, request.GET.get('include_watchers', 'false') == 'true')

@oauth_required
@api_response
def create_record(request):
	if 'work_id' in request.POST:
		try:
			work = Work.objects.get(id=request.POST['work_id'])
		except Work.DoesNotExist:
			return {"error": "Invalid work_id."}
	elif 'work_title' in request.POST:
		work, created = Work.objects.get_or_create(title=request.POST['work_title'])
	else:
		return {"error": "work_id or work_title is required."}

	if 'status_type' not in request.POST:
		return {"error": "status_type is required."}

	status_type = StatusTypes.from_name(request.POST['status_type'])
	if status_type is None:
		return {"error": "status_type should be watching, finished, suspended, or interested."}

	record, created = request.user.record_set.get_or_create(work=work)

	history = request.user.history_set.create(
		work = work,
		status = request.POST.get('status_text', ''),
		status_type = status_type,
		comment = request.POST.get('comment', ''),
	)

	return _history_as_dict(history)

@api_response
def get_chart(request, type):
	if type == 'work':
		chart_class = PopularWorksChart
	elif type == 'user':
		chart_class = ActiveUsersChart
	else:
		raise Http404

	period = request.GET.get('period')
	if period == 'week':
		period_class = Week
	elif period == 'month':
		period_class = Month
	else:
		period_class = None

	count = min(int(request.GET.get('count', 100)), 1000)

	if period_class:
		period = period_class.last()
		chart = compare_charts(
			chart_class(period, count),
			chart_class(period.prev(), count
		))
	else:
		period = None
		chart = chart_class(None, count)

	result = {}
	if period:
		result['start_date'] = chart.start
		result['end_date'] = chart.end

	result['items'] = items = []
	for item in chart:
		if item['diff'] is None:
			del item['diff']
		else:
			item['diff'] *= item['sign']
			del item['sign']
		if type == 'work':
			work = item['object']
			item['work'] = {'title': work.title, 'id': work.id}
		elif type == 'user':
			item['user'] = item['object'].username
		del item['object']
		items.append(item)

	return result
