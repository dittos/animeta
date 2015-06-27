from django.core.cache import cache
from django.shortcuts import render
from api import serializers
from chart.models import compare_charts

def serialize_chart(chart, limit):
    data = {}
    if chart.range:
        data['start'] = chart.start.strftime('%Y-%m-%d')
        data['end'] = chart.end.strftime('%Y-%m-%d')
    items = []
    for item in chart:
        if item['rank'] > limit:
            break
        item['object'] = {
            'link': item['object'].get_absolute_url(),
            'text': unicode(item['object'])
        }
        items.append(item)
    data['items'] = items
    return data

def detail(request, chart_class, range_class=None, title=''):
    if range_class:
        range = range_class.last()
        chart = compare_charts(chart_class(range), chart_class(range.prev()))
    else:
        range = None
        chart = chart_class()

    cache_key = 'chart/' + str(chart_class) + '_' + repr(range)
    chart_json = cache.get(cache_key)
    if not chart_json:
        chart_json = serialize_chart(chart, 100)
        cache.set(cache_key, chart_json, 7200)

    return render(request, 'chart.html', {
        'title': title,
        'preload_data': {
            'current_user': serializers.serialize_user(request.user, request.user) if request.user.is_authenticated() else None,
            'title': title,
            'chart': chart_json,
            'has_diff': range != None,
        }
    })
