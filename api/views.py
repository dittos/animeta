import pytz
from cStringIO import StringIO
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, render_to_response
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count
from api.decorators import api_response, api_auth_required
from api.models import generate_session_token
from work.models import Work, get_or_create_work, TitleMapping
from record.models import History, Record, StatusTypes, Uncategorized
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
        'work': history.record.title,
        'status': _serialize_status(history),
        'comment': history.comment,
        'updated_at': _serialize_datetime(history.updated_at),
        'url': 'http://animeta.net/-%d' % history.id
    }

@api_response
def auth(request):
    if request.method == 'POST':
        for key in 'username', 'password', 'app_token':
            if key not in request.POST:
                return {'error': 'Parameter "%s" is required.' % key, 'error_code': 403}

        if request.POST['app_token'] not in getattr(settings, 'API_APP_TOKENS', []):
            return {'error': 'Invalid application token.', 'error_code': 403}

        user = authenticate(username=request.POST['username'], password=request.POST['password'])
        if user is not None and user.is_active:
            return {'token': generate_session_token(user)}
        else:
            return {'error': 'Incorrect username or password.', 'error_code': 403}

    return {'error': 'Only POST method is allowed.', 'error_code': 400}

@api_response
def get_records(request):
    queryset = History.objects.order_by('-id')
    if 'user' in request.GET:
        queryset = queryset.filter(user__username=request.GET['user'])
    if 'item_id' in request.GET:
    	item = Record.objects.get(id=request.GET['item_id'])
    	queryset = queryset.filter(user=item.user, work=item.work)
    if 'work' in request.GET:
    	works = TitleMapping.objects.filter(title=request.GET['work']).values_list('work', flat=True)
        queryset = queryset.filter(work__in=works)
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

@api_auth_required
@api_response
def delete_record(request, id):
    history = get_object_or_404(History, id=id)
    if history.user != request.user:
        return {'error': "It's not your record", 'error_code': 403}
    history.delete()
    if history.record.history_set.count() == 0:
        history.record.delete()
    return True

def _category_as_dict(category):
    return {'id': category.id, 'name': category.name}

@api_response
def get_user(request, name):
    user = get_object_or_404(User, username=name)

    stats = {'total': user.record_set.count()}
    for t in StatusTypes.types:
        stats[t.name] = 0
    for d in user.record_set.values('status_type').annotate(count=Count('status_type')).order_by():
        stats[StatusTypes.to_name(d['status_type'])] = d['count']

    uncategorized = Uncategorized(user)
    categories = []
    for c in [uncategorized] + list(user.category_set.annotate(record_count=Count('record'))):
        categories.append({'id': c.id, 'name': c.name, 'count': c.record_count})

    result = {
        'name': user.username,
        'joined_at': _serialize_datetime(user.date_joined),
        'stats': stats,
        'categories': categories,
    }
    if request.GET.get('include_library_items', 'true') == 'true':
        result['library_items'] = [{
        	'id': record.id,
            'title': record.title,
            'status': _serialize_status(record),
            'category': _category_as_dict(record.category or uncategorized),
            'updated_at': _serialize_datetime(record.updated_at),
        } for record in user.record_set.order_by('-updated_at')]
    return result

@api_auth_required
def get_current_user(request):
    return get_user(request, request.user.username)

def _work_as_dict(work, include_watchers=False):
    watchers = {'total': work.index.record_count}
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
        'title': work.title,
        'rank': work.index.rank,
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
        # disable 'similar' match in debug mode
        if match == 'similar' and settings.DEBUG:
            match = 'prefix'

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
def get_work_by_title(request, title):
    work = get_object_or_404(Work, title=title)
    return _work_as_dict(work, request.GET.get('include_watchers', 'false') == 'true')

@api_auth_required
@api_response
def create_record(request):
    if 'work' in request.POST:
        title = request.POST['work']
        work = get_or_create_work(title)
    else:
        return {"error": "work is required."}

    if 'status_type' not in request.POST:
        return {"error": "status_type is required."}

    status_type = StatusTypes.from_name(request.POST['status_type'])
    if status_type is None:
        return {"error": "status_type should be watching, finished, suspended, or interested."}

    record, created = request.user.record_set.get_or_create(work=work, defaults={'title': title})

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
            chart_class(period.prev())
        )
    else:
        period = None
        chart = chart_class(None, count)

    result = {}
    if period:
        result['start_date'] = chart.start
        result['end_date'] = chart.end

    result['items'] = items = []
    for item in chart:
        if period:
            if item['diff'] is None:
                del item['diff']
            else:
                item['diff'] *= item['sign']
                del item['sign']
        if type == 'work':
            work = item['object']
            item['work'] = work.title
        elif type == 'user':
            item['user'] = item['object'].username
        del item['object']
        items.append(item)

    return result
