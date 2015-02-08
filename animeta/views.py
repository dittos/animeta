import json
import requests
from django.conf import settings
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
    preload_data = {
        'current_user': serializers.serialize_user(request.user, request.user) if request.user.is_authenticated() else None,
        'chart': _get_chart(),
        'posts': _get_timeline(),
    }
    try:
        resp = requests.post(settings.RENDER_BACKEND_URL + 'index',
            json=preload_data,
            timeout=settings.RENDER_BACKEND_TIMEOUT)
        html = resp.content
    except Exception as e:
        html = '<!-- Render server not responding: %s -->' % e
    return render(request, "index.html", {
        'preload_data': preload_data,
        'html': html,
    })

def redirect_to_index(request):
    return redirect('/')
