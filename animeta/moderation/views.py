# -*- coding: utf-8 -*-
from django.db import models
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.http import require_http_methods
from django.views.generic import list_detail
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from work.models import Work
from .models import MergeRequest, has_merge_request, merge

def merge_dashboard(request):
    error = None
    result = []

    if request.method == 'POST':
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

    return list_detail.object_list(request,
        queryset = MergeRequest.objects.order_by('-id'),
        paginate_by = 50,
        template_object_name = 'merge',
        template_name = 'moderation/merge.html',
        extra_context = {
            'contributors': User.objects.annotate(count=models.Count('mergerequest')).order_by('-count').exclude(count=0),
            'error': error,
            'result': result,
        }
    )
