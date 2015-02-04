import json
from django.shortcuts import render, redirect
from chart.models import weekly, compare_charts, PopularWorksChart
from record.models import History
from api import serializers

def _get_chart():
    def _serialize(item):
        work = item['object']
        item['object'] = serializers.serialize_work(work)
        return item
    w = weekly()
    chart = compare_charts(
        PopularWorksChart(w, 5),
        PopularWorksChart(w.prev())
    )
    return map(_serialize, chart)

def _get_timeline():
    return [serializers.serialize_post(post, include_record=True, include_user=True)
        for post in History.objects.select_related('user', 'work')
                .filter(work__index__record_count__gt=1)
                .exclude(comment='')[:10]]

def index(request):
    return render(request, 'index.html', {
        'preload_data': json.dumps({
            'current_user': serializers.serialize_user(request.user, request.user) if request.user.is_authenticated() else None,
            'chart': _get_chart(),
            'posts': _get_timeline()
        })
    })

def redirect_to_index(request):
    return redirect('/')
