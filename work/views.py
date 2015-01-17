# -*- coding: utf-8 -*-
import json
import urllib
from django.conf import settings
from django.shortcuts import get_object_or_404, render, redirect
from django.views.generic import ListView
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from work.models import Work, TitleMapping
from record.models import Record, History, get_episodes
from chart.models import weekly, PopularWorksChart
from api import serializers

def old_url(request, remainder):
    return redirect('work.views.detail', title=remainder)

def merge_dashboard(request):
    return redirect('/moderation/merge/')

def _get_record(request, work):
    if request.user.is_authenticated():
        try:
            record = request.user.record_set.get(work=work)
        except:
            record = None
    else:
        record = None
    return record

def _get_work(title):
    return get_object_or_404(TitleMapping, title=title).work

def _get_chart():
    def _serialize(item):
        item['object'] = serializers.serialize_work(item['object'])
        return item
    w = weekly()
    chart = PopularWorksChart(w, 5)
    return map(_serialize, chart)

def detail(request, title):
    work = _get_work(title)
    return render(request, "work/work_detail.html", {
        'title': title,
        'preload_data': json.dumps({
            'title': title,
            'current_user': serializers.serialize_user(request.user, request.user) if request.user.is_authenticated() else None,
            'daum_api_key': settings.DAUM_API_KEY,
            'chart': _get_chart(),
        })
    })

def episode_detail(request, title, ep):
    ep = int(ep)
    return detail(request, title)

def list_users(request, title):
    work = _get_work(title)
    return render(request, "work/users.html", {
        'work': work,
        'record': _get_record(request, work),
        'records': work.record_set.select_related('user') \
                .order_by('status_type', 'user__username')
    })

def video(request, title, provider, id):
    assert provider == 'tvpot'
    return redirect('http://tvpot.daum.net/v/' + id)
