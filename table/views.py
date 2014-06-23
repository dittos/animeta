import json
from django.shortcuts import render, redirect
from table import models

def redirect_to_current(request):
    return redirect('table-index', period='2014Q3')

def index(request, period):
    period = models.Period.parse(period)
    data = models.load_data(period)
    data = models.annotate_statuses(data, request.user)
    return render(request, 'table/index.html', {
        'period': period,
        'data': json.dumps(data),
    })
