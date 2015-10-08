# -*- coding: utf-8 -*-
from django.conf import settings
from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse
from django.utils.http import urlquote
from animeta.utils import call_render_backend, call_api_internal, get_current_user


def old_url(request, remainder):
    return redirect('work.views.detail', title=remainder)


def detail(request, title):
    work = call_api_internal(request, '/works/_/' + urlquote(title))
    preload_data = {
        'title': title,
        'work': work,
        'current_user': get_current_user(request),
        'daum_api_key': settings.DAUM_API_KEY,
        'chart': call_api_internal(request, '/charts/works/weekly', {'limit': 5}),
    }
    content_data = {
        'title': title,
        'preload_data': preload_data,
        'html': call_render_backend('work', preload_data),
    }
    try:
        studios = u','.join(work['metadata']['studios'])
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
    post = call_api_internal(request, '/posts/' + id)
    work = call_api_internal(request, '/works/%s' % post['record']['work_id'])
    preload_data = {
        'post': post,
        'work': work,
        'current_user': get_current_user(request),
        'daum_api_key': settings.DAUM_API_KEY,
        'chart': call_api_internal(request, '/charts/works/weekly', {'limit': 5}),
    }
    return render(request, 'post.html', {
        'title': post['record']['title'],
        'preload_data': preload_data,
        'html': call_render_backend('post', preload_data),
    })
