from django.shortcuts import render, redirect
from animeta.utils import call_api_internal, get_current_user
from table import models

CURRENT_PERIOD = models.Period.parse('2015Q4')


def index(request):
    #return _render(request, 'table/index.html', CURRENT_PERIOD)
    return redirect('/table/%s/' % CURRENT_PERIOD)


def get_period(request, period):
    period = models.Period.parse(period)
    return _render(request, 'table/period.html', period, True)


def _render(request, template_name, period, only_first_period=False):
    data = call_api_internal(request, '/table/periods/%s' % period, {
        'only_first_period': only_first_period,
    })
    return render(request, template_name, {
        'period': period,
        'preload_data': {
            'period': str(period),
            'current_user': get_current_user(request),
            'schedule': data,
        },
    })
