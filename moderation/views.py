# -*- coding: utf-8 -*-
import json
from django.db import models, transaction
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.http import require_http_methods
from django.views.generic import ListView
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required, user_passes_test

from work.models import Work, TitleMapping, normalize_title, get_or_create_work
from .models import MergeRequest, has_merge_request, merge

class MergeDashboardView(ListView):
    queryset = MergeRequest.objects.order_by('-id')
    paginate_by = 50
    context_object_name = 'merge_list'
    template_name = 'moderation/merge.html'

    def __init__(self, *args, **kwargs):
        super(MergeDashboardView, self).__init__(*args, **kwargs)
        self.error = None
        self.result = []

    def post(self, request):
        error = None
        result = []

        if 'apply' in request.POST:
            for id in request.POST.getlist('apply'):
                req = MergeRequest.objects.get(id=id)
                try:
                    if req.target.popularity >= req.source.popularity:
                        f = merge(req.target, req.source)
                        result.append((False, req.target, req.source, f))
                    else:
                        f = merge(req.source, req.target)
                        result.append((False, req.source, req.target, f))
                except:
                    result.append((True, req.target, req.source, None))
        else:
            work = Work.objects.get(title=request.POST['target'])
            source = Work.objects.get(title=request.POST['source'])
            if has_merge_request(work, source):
                error = u'이미 요청이 있습니다.'
            else:
                MergeRequest.objects.create(user=request.user, source=source, target=work)

        self.error = error
        self.result = result
        return super(MergeDashboardView, self).get(request)

    def get_context_data(self, **kwargs):
        context = super(MergeDashboardView, self).get_context_data(**kwargs)
        context.update({
            'contributors': User.objects.annotate(count=models.Count('mergerequest')).order_by('-count').exclude(count=0),
            'error': self.error,
            'result': self.result,
        })
        return context

def test_is_staff(user):
    return user.is_staff

@user_passes_test(test_is_staff)
def index(request):
    return render(request, 'moderation/index.html', {
        'recent_works': Work.objects.order_by('-id').filter(index__record_count__gt=0)[:20]
    })

@user_passes_test(test_is_staff)
def create_work(request):
    title = request.POST['title'].strip()
    work = get_or_create_work(title)
    return redirect('moderation.views.work_detail', work_id=work.id)

@user_passes_test(test_is_staff)
def work_detail(request, work_id):
    work = Work.objects.get(pk=work_id)
    return render(request, 'moderation/index.html', {'work': work})

@user_passes_test(test_is_staff)
def merge_work(request, work_id):
    work = Work.objects.get(pk=work_id)
    other = Work.objects.get(pk=request.POST['other_id'])
    if work.id == other.id:
        return HttpResponse(json.dumps({'ok': False, 'error': 'Cannot merge itself'}), content_type='application/json')
    force = request.POST.get('force') == '1'
    conflicts = []
    for u in (User.objects.filter(record__work__in=[work, other])
        .annotate(count=models.Count('record__work'))
        .filter(count__gt=1)):
        conflicts.append({
            'user_id': u.id,
            'username': u.username,
            'ids': [r.id for r in u.record_set.filter(work__in=[work, other])]
        })
    if conflicts and not force:
        return HttpResponse(json.dumps({'ok': False, 'conflicts': conflicts}), content_type='application/json')
    with transaction.atomic():
        for c in conflicts:
            u = User.objects.get(pk=c['user_id'])
            u.history_set.filter(work=other).delete()
            u.record_set.filter(work=other).delete()
        other.title_mappings.update(work=work)
        other.record_set.update(work=work)
        other.history_set.update(work=work)
        other.delete()
    return HttpResponse(json.dumps({'ok': True, 'conflicts': conflicts}), content_type='application/json')

@user_passes_test(test_is_staff)
def set_primary_title(request, mapping_id):
    mapping = TitleMapping.objects.get(pk=mapping_id)
    mapping.work.title = mapping.title
    mapping.work.save()
    return redirect('moderation.views.work_detail', work_id=mapping.work.id)

@user_passes_test(test_is_staff)
def add_mapping(request, work_id):
    work = Work.objects.get(pk=work_id)
    title = request.POST['title'].strip()
    key = normalize_title(title)
    if TitleMapping.objects.filter(key=key).exclude(work=work).count() > 0:
        raise Exception
    mapping = TitleMapping.objects.create(
        work=work,
        title=title,
        key=normalize_title(title),
    )
    return redirect('moderation.views.work_detail', work_id=work.id)

@user_passes_test(test_is_staff)
def delete_mapping(request, mapping_id):
    mapping = TitleMapping.objects.get(pk=mapping_id)
    if mapping.record_count == 0:
        mapping.delete()
    return redirect('moderation.views.work_detail', work_id=mapping.work.id)
