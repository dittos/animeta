# -*- coding: utf-8 -*-
import urllib
from django.conf import settings
from django.shortcuts import get_object_or_404, render, redirect
from django.views.generic import ListView
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from work.models import Work, TitleMapping
from record.models import Record, History, get_episodes

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

def detail(request, title):
    work = get_object_or_404(Work, title=title)

    N = 6
    history = work.history_set.all().select_related('user')
    comments = list(history.exclude(comment='')[:N])
    if len(comments) < N:
        comments += list(history.filter(comment='')[:N-len(comments)])

    alt_titles = TitleMapping.objects.filter(work=work) \
            .exclude(title=work.title).values_list('title', flat=True)
    return render(request, "work/work_detail.html", {
        'work': work,
        'episodes': get_episodes(work),
        'record': _get_record(request, work),
        'records': work.record_set,
        'alt_titles': alt_titles,
        'comments': comments,
        'daum_api_key': settings.DAUM_API_KEY
    })

def episode_detail(request, title, ep):
    ep = int(ep)
    work = get_object_or_404(Work, title=title)
    history_list = work.history_set.filter(status=str(ep)).exclude(comment='').order_by('-id')
    return render(request, 'work/episode.html', {
        'work': work,
        'current_episode': ep,
        'episodes': get_episodes(work),
        'record': _get_record(request, work),
        'history_list': history_list,
    })

def list_users(request, title):
    work = get_object_or_404(Work, title=title)
    return render(request, "work/users.html", {
        'work': work,
        'record': _get_record(request, work),
        'records': work.record_set.select_related('user') \
                .order_by('status_type', 'user__username')
    })

def video(request, title, provider, id):
    work = get_object_or_404(Work, title=title)

    return render(request, "work/video.html", {
        'work': work,
        'record': _get_record(request, work),
        'records': work.record_set,
        'video_id': id
    })

class SearchView(ListView):
    def get_queryset(self):
        self.keyword = self.request.GET.get('keyword', '')
        return Work.objects.filter(title__icontains=self.keyword)

    def get_context_data(self, **kwargs):
        context = super(SearchView, self).get_context_data(**kwargs)
        context['keyword'] = self.keyword
        return context
