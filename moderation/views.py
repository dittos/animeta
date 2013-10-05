# -*- coding: utf-8 -*-
from django.db import models
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.http import require_http_methods
from django.views.generic import ListView
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from work.models import Work
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
