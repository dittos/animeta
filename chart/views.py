import datetime
from django.shortcuts import render
from django.contrib.auth.models import User
from django.views.generic import list_detail
from chart.models import weekly, compare_charts, PopularWorksChart, ActiveUsersChart
from record.models import History, include_records

def load_comments(chart):
    for row in chart:
        rank = row['rank']
        n = 4 // rank if rank <= 2 else 0
        row['records'] = row['object'].history_set.select_related('user').exclude(comment='')[:n]
        yield row

def main(request):
    w = weekly()
    chart = compare_charts(
        PopularWorksChart(w, 5),
        PopularWorksChart(w.prev())
    )
    return render(request, 'chart/index.html', {
        'weekly_works': load_comments(chart),
        'timeline': History.objects.select_related('user', 'work') \
                .exclude(comment='')[:6].transform(include_records)
    })

def timeline(request):
    return list_detail.object_list(request,
        template_name = 'chart/timeline.html',
        queryset = History.objects.select_related('work', 'user') \
                .exclude(comment='').transform(include_records),
        paginate_by = 8
    )

def detail(request, chart_class, range_class=None, title=''):
    if range_class:
        range = range_class.last()
        chart = compare_charts(chart_class(range), chart_class(range.prev()))
    else:
        range = None
        chart = chart_class()

    return render(request, 'chart/detail.html', {
        'title': title,
        'chart': chart,
        'cache_key': str(chart_class) + '_' + repr(range),
        'has_diff': range != None,
    })
