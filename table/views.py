import json
from django.shortcuts import render, redirect
from table import models

CURRENT_PERIOD = models.Period.parse('2014Q4')

def index(request):
    return redirect('table-period', period=CURRENT_PERIOD)
    data = models.load_data(CURRENT_PERIOD)
    data = models.annotate_statuses(data, request.user)
    return render(request, 'table/index.html', {
        'period': CURRENT_PERIOD,
        'data': json.dumps(data),
    })

def get_period(request, period):
    period = models.Period.parse(period)
    data = models.load_data(period)
    data = models.annotate_statuses(data, request.user)
    return render(request, 'table/period.html', {
        'period': period,
        'data': json.dumps(data),
    })
