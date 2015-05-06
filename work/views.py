# -*- coding: utf-8 -*-
import requests
from django.conf import settings
from django.shortcuts import get_object_or_404, render, redirect
from django.core.urlresolvers import reverse
from work.models import TitleMapping
from chart.models import weekly, PopularWorksChart
from record.models import History
from api import serializers

def old_url(request, remainder):
    return redirect('work.views.detail', title=remainder)

def _get_work(title):
    return get_object_or_404(TitleMapping, title=title).work

def _get_chart():
    def _serialize(item):
        item['object'] = serializers.serialize_work(item['object'])
        return item
    w = weekly()
    chart = PopularWorksChart(w, 5)
    return map(_serialize, chart)

def _call_backend(path, preload_data):
    try:
        resp = requests.post(settings.RENDER_BACKEND_URL + path,
            json=preload_data,
            timeout=settings.RENDER_BACKEND_TIMEOUT)
        html = resp.content
    except Exception as e:
        html = '<!-- Render server not responding: %s -->' % e
    return html

def detail(request, title):
    work = _get_work(title)
    preload_data = {
        'title': title,
        'work': serializers.serialize_work(work, request.user),
        'current_user': serializers.serialize_user(request.user, request.user) if request.user.is_authenticated() else None,
        'daum_api_key': settings.DAUM_API_KEY,
        'chart': _get_chart(),
    }
    content_data = {
        'title': title,
        'preload_data': preload_data,
        'html': _call_backend('work', preload_data),
    }
    try:
        studios = u','.join(preload_data['work']['metadata']['studios'])
        content_data.update({
            'meta_description': u'{} 제작'.format(studios),
            'meta_keywords': u','.join([title, studios]),
        })
    except KeyError:
        pass
    return render(request, "work.html", content_data)

def episode_detail(request, title, ep):
    ep = int(ep)
    return redirect(reverse('work.views.detail', kwargs={'title': title}) + '#/ep/%s/' % ep)

def list_users(request, title):
    return redirect(reverse('work.views.detail', kwargs={'title': title}))

def video(request, title, provider, id):
    assert provider == 'tvpot'
    return redirect('http://tvpot.daum.net/v/' + id)

def post_detail(request, id):
    post = get_object_or_404(History, id=id)
    preload_data = {
        'post': serializers.serialize_post(post, include_user=True),
        'work': serializers.serialize_work(post.work),
        'current_user': serializers.serialize_user(request.user, request.user) if request.user.is_authenticated() else None,
        'daum_api_key': settings.DAUM_API_KEY,
        'chart': _get_chart(),
    }
    return render(request, 'post.html', {
        'title': post.record.title,
        'preload_data': preload_data,
        'html': _call_backend('post', preload_data),
    })
