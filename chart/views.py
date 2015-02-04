from django.shortcuts import render
from chart.models import compare_charts

def detail(request, chart_class, range_class=None, title=''):
    if range_class:
        range = range_class.last()
        chart = compare_charts(chart_class(range), chart_class(range.prev()))
    else:
        range = None
        chart = chart_class()

    return render(request, 'chart.html', {
        'title': title,
        'chart': chart,
        'cache_key': str(chart_class) + '_' + repr(range),
        'has_diff': range != None,
    })
