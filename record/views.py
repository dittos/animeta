# -*- coding: utf-8 -*-
import json
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.views.generic import ListView
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from work.models import Work, get_or_create_work
from .models import Record, History, Category, Uncategorized, StatusTypes
from .forms import SimpleRecordFormSet

@login_required
def add(request, title=''):
    from user.views import library
    return library(request, request.user.username)

def _get_record(request, id):
    record = get_object_or_404(Record, id=id)
    if record.user != request.user:
        raise Exception('Access denied')
    return record

def update(request, id):
    from user.views import library
    record = get_object_or_404(Record, id=id)
    return library(request, record.user.username)

@login_required
def delete(request, id):
    record = _get_record(request, id)
    if request.method == 'POST':
        record.delete()
        return redirect(request.user)
    else:
        return render(request, 'record/record_confirm_delete.html', {'record': record, 'owner': request.user})

@login_required
def add_many(request):
    addition_log = []
    if request.method == 'POST':
        formset = SimpleRecordFormSet(request.POST)
        if formset.is_valid():
            for row in formset.cleaned_data:
                if not row: continue
                title = row['work_title'].strip()
                work = get_or_create_work(title)
                addition_log.append(title)
                history = History.objects.create(user=request.user, work=work, status_type=StatusTypes.Finished)
                record = history.record
                record.title = title
                record.save()

    return render(request, 'record/import.html',
        {'owner': request.user, 'formset': SimpleRecordFormSet(),
         'addition_log': addition_log})

@login_required
def category(request):
    from user.views import library
    return library(request, request.user.username)

def shortcut(request, id):
    history = get_object_or_404(History, id=id)
    return redirect('/users/%s/history/%d/' % (history.user.username, history.id))

class HistoryDetailView(ListView):
    paginate_by = 10
    template_name = 'record/history_detail.html'

    def get_queryset(self):
        self.user = get_object_or_404(User, username=self.kwargs['username'])
        self.history = get_object_or_404(self.user.history_set, id=self.kwargs['id'])
        return History.objects.filter(work=self.history.work, status=self.history.status) \
                .exclude(user=self.user).exclude(comment='')

    def get_context_data(self, **kwargs):
        context = super(HistoryDetailView, self).get_context_data(**kwargs)
        context.update({
            'owner': self.user,
            'history': self.history,
            'can_delete': self.history.deletable_by(self.request.user),
        })
        return context

@login_required
def delete_history(request, username, id):
    user = get_object_or_404(User, username=username)
    history = get_object_or_404(user.history_set, id=id)
    if request.user != history.user:
        raise Exception('Access denied')
    
    if history.record.history_set.count() == 1:
        raise Exception() # XXX

    if request.method == 'POST':
        history.delete()
        return redirect(request.user)
    else:
        return render(request, 'record/history_confirm_delete.html', {'history': history, 'owner': request.user})
