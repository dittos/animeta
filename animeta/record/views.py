# -*- coding: utf-8 -*-
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.views.generic import list_detail
from django.views.generic.simple import direct_to_template
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from work.models import Work, suggest_works
from record.models import Record, History, Category, Uncategorized, StatusTypes
from record.forms import RecordAddForm, RecordUpdateForm, SimpleRecordFormSet
from connect import get_connected_services

def _return_to_user_page(request):
	return HttpResponseRedirect(request.user.get_absolute_url())

def save(request, form_class, object, form_initial, template_name, extra_context = {}):
	if request.method == 'POST':
		form = form_class(object, request.POST)
		if form.is_valid():
			form.save()
			if request.POST.get('next'):
				# CSRF?
				return HttpResponseRedirect(request.POST['next'])
			else:
				return _return_to_user_page(request)
	else:
		form = form_class(object, initial=form_initial)

	extra_context.update({
		'form': form,
		'owner': request.user,
		'connected_services': get_connected_services(request.user)
	})
	return direct_to_template(request, template_name, extra_context)

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
		work, _ = Work.objects.get_or_create(title=request.POST['work_title'])
		record.history_set.update(work=work)
		record.work = work
		record.save()
		return _return_to_user_page(request)
	elif 'category' in request.POST:
		id = request.POST['category']
		if not id:
			record.category = None
		else:
			record.category = request.user.category_set.get(id=id)
		record.save()
		return _return_to_user_page(request)
	else:
		return save(request,
			RecordUpdateForm, record, {'status': record.status, 'category': record.category.id if record.category else None},
			template_name = 'record/update_record.html',
			extra_context = {
				'record': record,
				'work': record.work,
				'category_list': request.user.category_set.all(),
				'history_list': request.user.history_set.filter(work=record.work)
			})

@login_required
def delete(request, id):
	record = _get_record(request, id)
	if request.method == 'POST':
		record.delete()
		return _return_to_user_page(request)
	else:
		return direct_to_template(request, 'record/record_confirm_delete.html', {'record': record, 'owner': request.user})

@login_required
def add_many(request):
	addition_log = []
	if request.method == 'POST':
		formset = SimpleRecordFormSet(request.POST)
		if formset.is_valid():
			for row in formset.cleaned_data:
				if not row: continue
				work, _ = Work.objects.get_or_create(title=row['work_title'])
				addition_log.append(work.title)
				History.objects.create(user=request.user, work=work, status_type=StatusTypes.Finished)

	return direct_to_template(request, 'record/import.html',
		{'owner': request.user, 'formset': SimpleRecordFormSet(),
		 'addition_log': addition_log})

@login_required
def delete_category(request, id):
	category = Category.objects.get(user=request.user, id=id)
	request.user.record_set.filter(category=category).update(category=None)
	category.delete()
	return HttpResponseRedirect('/records/category/')

@login_required
def rename_category(request, id):
	category = Category.objects.get(user=request.user, id=id)
	if request.method == 'POST':
		category.name = request.POST['name']
		category.save()
		return HttpResponseRedirect('/records/category/')
	else:
		return direct_to_template(request, 'record/rename_category.html',
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
			return HttpResponseRedirect('/records/category/')

@login_required
def category(request):
	return direct_to_template(request, 'record/manage_category.html',
		{'categories': request.user.category_set.all(),
		 'uncategorized': Uncategorized(request.user)})

@login_required
def reorder_category(request):
	for position, id in enumerate(request.POST.getlist('order[]')):
		request.user.category_set.filter(id=int(id)).update(position=position)
	return HttpResponse("true")

def shortcut(request, id):
	history = get_object_or_404(History, id=id)
	return HttpResponseRedirect('/users/%s/history/%d/' % (history.user.username, history.id))

def history_detail(request, username, id):
	user = get_object_or_404(User, username=username)
	history = get_object_or_404(user.history_set, id=id)
	return list_detail.object_list(request,
		queryset = History.objects.filter(work=history.work, status=history.status).exclude(user=user),
		paginate_by = 5,
		template_name = 'record/history_detail.html',
		extra_context = {'owner': user, 'history': history}
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
		return _return_to_user_page(request)
	else:
		return direct_to_template(request, 'record/history_confirm_delete.html', {'history': history, 'owner': request.user})

def suggest(request):
	result = suggest_works(request.GET['q'], user=request.user )
	return HttpResponse('\n'.join(result[:10].values_list('title', flat=True)))
