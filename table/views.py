import json
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
    indexes = WorkPeriodIndex.objects.filter(period=str(period)).all()
    if exclude_continuous:
        # Only include new or split-cour animes
        prev_period = str(period.prev())
        indexes = filter(lambda i: prev_period not in i.work.metadata['periods'], indexes)
    data = [serializers.serialize_work(index.work, request.user) for index in indexes]
    return render(request, template_name, {
        'period': period,
        'preload_data': {
            'period': str(period),
            'current_user': serializers.serialize_user(request.user, request.user) if request.user.is_authenticated() else None,
            'schedule': data
        },
    })
