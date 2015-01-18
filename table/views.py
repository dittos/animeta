import json
from django.shortcuts import render, redirect
from table import models
from search.models import WorkPeriodIndex
from api import serializers

CURRENT_PERIOD = models.Period.parse('2014Q4')

def index(request):
    return _render(request, 'table/index.html', CURRENT_PERIOD)

def get_period(request, period):
    period = models.Period.parse(period)
    return _render(request, 'table/period.html', period)

def _render(request, template_name, period):
    indexes = WorkPeriodIndex.objects.filter(period=str(period)).all()
    data = [serializers.serialize_work(index.work, request.user) for index in indexes]
    return render(request, template_name, {
        'period': period,
        'preload_data': json.dumps({
            'period': str(period),
            'current_user': serializers.serialize_user(request.user, request.user) if request.user.is_authenticated() else None,
            'schedule': data
        }),
    })
