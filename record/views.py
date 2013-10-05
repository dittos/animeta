# -*- coding: utf-8 -*-
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.views.generic import list_detail
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from work.models import Work, suggest_works, get_or_create_work
from .models import Record, History, Category, Uncategorized, StatusTypes
from .forms import RecordAddForm, RecordUpdateForm, SimpleRecordFormSet
from connect import get_connected_services

def save(request, form_class, object, form_initial, template_name, extra_context = {}):
    if request.method == 'POST':
        form = form_class(object, request.POST)
        if form.is_valid():
            form.save()
            if request.POST.get('next'):
                # CSRF?
                return redirect(request.POST['next'])
            else:
                return redirect(request.user)
    else:
        form = form_class(object, initial=form_initial)

    extra_context.update({
        'form': form,
        'owner': request.user,
        'connected_services': get_connected_services(request.user)
    })
    return render(request, template_name, extra_context)

@login_required
def add(request, title=''):
    return save(request,
        RecordAddForm, request.user, {'work_title': title},
        template_name = 'record/record_form.html')

def _get_record(request, id):
    record = get_object_or_404(Record, id=id)
    if record.user != request.user:
        raise Exception('Access denied')
    return record

@login_required
def update(request, id):
    record = _get_record(request, id)
    if 'work_title' in request.POST:
        try:
            record.update_title(request.POST['work_title'])
            return redirect(request.user)
        except:
            transaction.rollback()
            messages.error(request, u'이미 같은 작품이 등록되어 있어 제목을 바꾸지 못했습니다.')
            return redirect('/records/%d/update/' % record.id)
    elif 'category' in request.POST:
        id = request.POST['category']
        if not id:
            record.category = None
        else:
            record.category = request.user.category_set.get(id=id)
        record.save()
        return redirect(request.user)
    else:
        history_list = request.user.history_set.filter(work=record.work)
        return save(request,
            RecordUpdateForm, record, {},
            template_name = 'record/update_record.html',
            extra_context = {
                'record': record,
                'work': record.work,
                'category_list': request.user.category_set.all(),
                'history_list': history_list,
                'can_delete': request.user == record.user and history_list.count() > 1
            })

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
def delete_category(request, id):
    category = Category.objects.get(user=request.user, id=id)
    request.user.record_set.filter(category=category).update(category=None)
    category.delete()
    return redirect('/records/category/')

@login_required
def rename_category(request, id):
    category = Category.objects.get(user=request.user, id=id)
    if request.method == 'POST':
        category.name = request.POST['name']
        category.save()
        return redirect('/records/category/')
    else:
        return render(request, 'record/rename_category.html',
            {'category': category})

@login_required
def add_category(request):
    if request.method == 'POST':
        name = request.POST['name']
        records = request.POST.getlist('record[]')
        if name.strip() != '':
            category = Category.objects.create(user=request.user, name=name)
            for record_id in records:
                record = Record.objects.get(id=record_id, user=request.user)
                record.category = category
                record.save()
            return redirect('/records/category/')

@login_required
def category(request):
    return render(request, 'record/manage_category.html',
        {'categories': request.user.category_set.all(),
         'uncategorized': Uncategorized(request.user)})

@login_required
def reorder_category(request):
    for position, id in enumerate(request.POST.getlist('order[]')):
        request.user.category_set.filter(id=int(id)).update(position=position)
    return HttpResponse("true")

def shortcut(request, id):
    history = get_object_or_404(History, id=id)
    return redirect('/users/%s/history/%d/' % (history.user.username, history.id))

def history_detail(request, username, id):
    user = get_object_or_404(User, username=username)
    history = get_object_or_404(user.history_set, id=id)
    return list_detail.object_list(request,
        queryset = History.objects.filter(work=history.work, status=history.status).exclude(user=user).exclude(comment=''),
        paginate_by = 10,
        template_name = 'record/history_detail.html',
        extra_context = {'owner': user, 'history': history, 'can_delete': history.deletable_by(request.user)}
    )

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

def suggest(request):
    result = suggest_works(request.GET['q'], user=request.user )
    return HttpResponse('\n'.join(result[:10].values_list('title', flat=True)))
