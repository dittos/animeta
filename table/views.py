from django.core.cache import cache
from django.shortcuts import render, redirect
from table import models
from search.models import WorkPeriodIndex
from api import serializers

CURRENT_PERIOD = models.Period.parse('2015Q4')

def index(request):
    #return _render(request, 'table/index.html', CURRENT_PERIOD)
    return redirect('/table/%s/' % CURRENT_PERIOD)

def get_period(request, period):
    period = models.Period.parse(period)
    return _render(request, 'table/period.html', period, True)

def _render(request, template_name, period, exclude_continuous=False):
    cache_key = 'table:%s:%s' % (template_name, period)
    data = cache.get(cache_key)
    if data is None:
        indexes = WorkPeriodIndex.objects.select_related('work', 'work__index')\
            .filter(period=str(period))
        if exclude_continuous:
            indexes = indexes.exclude(is_first_period=False)
        data = [serializers.serialize_work(index.work) for index in indexes]
        cache.set(cache_key, data, 60 * 60)
    if request.user.is_authenticated():
        records = {}
        for record in request.user.record_set.filter(work_id__in=[work['id'] for work in data]):
            records[record.work_id] = serializers.serialize_record(record)
        for work in data:
            if work['id'] in records:
                work['record'] = records[work['id']]
    return render(request, template_name, {
        'period': period,
        'preload_data': {
            'period': str(period),
            'current_user': serializers.serialize_user(request.user, request.user) if request.user.is_authenticated() else None,
            'schedule': data
        },
    })
