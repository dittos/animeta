# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, render, redirect
from django.views.generic import ListView
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from record.models import Record, History
from user.views import library

@login_required
def add(request, title=''):
    return library(request, request.user.username)

def update(request, id):
    record = get_object_or_404(Record, id=id)
    return library(request, record.user.username)

@login_required
def delete(request, id):
    record = get_object_or_404(Record, id=id)
    return library(request, record.user.username)

@login_required
def category(request):
    return library(request, request.user.username)

class HistoryDetailView(ListView):
    paginate_by = 10
    template_name = 'record/history_detail.html'

    def get_queryset(self):
        self.history = get_object_or_404(History, id=self.kwargs['id'])
        return History.objects.filter(work=self.history.work, status=self.history.status) \
                .exclude(user=self.history.user).exclude(comment='')

    def get_context_data(self, **kwargs):
        context = super(HistoryDetailView, self).get_context_data(**kwargs)
        context.update({
            'history': self.history,
        })
        return context
