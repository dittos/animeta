# -*- coding: utf-8 -*-
from django.views.generic.simple import direct_to_template
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from work.models import Work
from record.models import Record, History, Category
from record.forms import RecordAddForm, RecordUpdateForm
from django.shortcuts import get_object_or_404
from connect import get_connected_services

def _return_to_user_page(request):
	return HttpResponseRedirect(request.user.get_absolute_url())

def save(request, form_class, object, form_initial, template_name, extra_context = {}):
	if request.method == 'POST':
		form = form_class(object, data=request.POST)
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
	return save(request,
		RecordUpdateForm, record, {'status': record.status, 'category': record.category.id if record.category else None},
		template_name = 'record/update_record.html',
		extra_context = {
			'record': record, 'work': record.work,
			'history_list': request.user.history_set.filter(work=record.work)
		})

@login_required
def delete(request, id):
	record = _get_record(request, id)
	if request.method == 'POST':
		if request.POST['delete_history'] == '1':
			request.user.history_set.filter(work=record.work).delete()
		record.delete()
		return _return_to_user_page(request)
	else:
		return direct_to_template(request, 'record/record_confirm_delete.html', {'record': record, 'owner': request.user})

@login_required
def add_many(request):
	from record.forms import SimpleRecordFormSet
	addition_log = []
	if request.method == 'POST':
		formset = SimpleRecordFormSet(request.POST)
		if formset.is_valid():
			for row in formset.cleaned_data:
				if not row: continue
				work, _ = Work.objects.get_or_create(title=row['work_title'])
				addition_log.append(work.title)
				record, created = request.user.record_set.get_or_create(work=work)

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
	from record.models import Uncategorized
	return direct_to_template(request, 'record/manage_category.html',
		{'categories': request.user.category_set.all(),
		 'uncategorized': Uncategorized(request.user)})

def shortcut(request, id):
	history = get_object_or_404(History, id=id)
	return HttpResponseRedirect('/users/%s/history/%d/' % (history.user.username, history.id))

def history_detail(request, username, id):
	from django.views.generic import list_detail
	user = get_object_or_404(User, username=username)
	history = user.history_set.get(id=id)
	return list_detail.object_list(request,
		queryset = History.objects.filter(work__normalized_title=history.work.normalized_title, status=history.status).exclude(user=user),
		paginate_by = 5,
		template_name = 'record/history_detail.html',
		extra_context = {'owner': user, 'history': history}
	)

def suggest(request):
	from django.http import HttpResponse
	result = Work.objects.filter(title__startswith=request.GET['q'])[:10].values_list('title', flat=True)
	return HttpResponse('\n'.join(result))
