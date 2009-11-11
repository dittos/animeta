# -*- coding: utf-8 -*-
from django.views.generic.simple import direct_to_template
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from work.models import Work
from record.models import Record, History
from record.forms import RecordForm
from django.shortcuts import get_object_or_404

def _return_to_user_page(request):
	return HttpResponseRedirect(request.user.get_absolute_url())

def get_me2_setting(user):
	from connect.models import Me2Setting
	try:
		return Me2Setting.objects.get(user=user)
	except:
		return None

@login_required
def add(request, title=''):
	form = RecordForm(initial={'work_title': title})
	form.fields['category'].queryset = request.user.category_set
	return direct_to_template(request, 'record/record_form.html', {
		'form': form,
		'owner': request.user,
		'me2day': get_me2_setting(request.user)
	})

def _get_record(request, id):
	record = get_object_or_404(Record, id=id)
	if record.user != request.user:
		raise Exception('Access denied')
	return record

@login_required
def update(request, id):
	record = _get_record(request, id)
	form = RecordForm(initial={'work_title': record.work.title, 'status': record.status, 'category': record.category.id if record.category else None})
	form.fields['category'].queryset = request.user.category_set
	return direct_to_template(request, 'record/record_form.html',
		{'form': form, 'owner': request.user, 'record': record,
		 'me2day': get_me2_setting(request.user)})

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
def save(request):
	user = request.user
	form = RecordForm(request.POST)
	form.fields['category'].queryset = request.user.category_set
	if form.is_valid():
		category = form.cleaned_data['category']
		work, created = Work.objects.get_or_create(title=form.cleaned_data['work_title'])
		try:
			record = user.record_set.create(
				work=work,
				status=form.cleaned_data['status'],
				category=category
			)
		except: # already have the record
			record = user.record_set.get(work=work)
			record.status = form.cleaned_data['status']
			record.category = category
			record.save()

			# delete previous history if just comment is changed
			prev = record.history_set.latest('updated_at')
			if prev.status == form.cleaned_data['status'] and not prev.comment.strip():
				prev.delete()

		history = user.history_set.create(
			work=work,
			status=record.status,
			comment=form.cleaned_data['comment'],
			updated_at=record.updated_at
		)

		if form.cleaned_data['me2day_send']:
			from connect.models import Me2Setting
			from record.templatetags.status import status_text
			from django.core.urlresolvers import reverse
			import connect.me2day as me2
			try:
				setting = Me2Setting.objects.get(user=request.user)
				body = u'"%s %s":http://animeta.net%s' % (work.title, status_text(record.status), reverse(history_detail, args=[request.user.username, history.id]))
				if form.cleaned_data['comment']:
					body += u' : ' + form.cleaned_data['comment']
				tags = 'me2animeta %s %s' % (work.title, status_text(record.status))
				me2.call('create_post', setting.userid, setting.userkey, {
					'post[body]': body.encode('utf-8'),
					'post[tags]': tags.encode('utf-8')
				})
			except:
				request.user.message_set.create(message='미투데이에 보내기 실패')

		if request.POST.get('next'):
			# CSRF?
			return HttpResponseRedirect(request.POST['next'])
		else:
			return _return_to_user_page(request)
	
	else:
		request.user.message_set.create(message='작품 제목을 입력하세요.')
		return HttpResponseRedirect(request.META['HTTP_REFERER'])

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
				if created:
					request.user.history_set.create(work=work)

	return direct_to_template(request, 'record/import.html',
		{'owner': request.user, 'formset': SimpleRecordFormSet(),
		 'addition_log': addition_log})

@login_required
def add_category(request):
	if request.method == 'POST':
		name = request.POST['name']
		if name.strip() != '':
			from record.models import Category
			category = Category.objects.create(user=request.user, name=name)
			return HttpResponseRedirect(request.user.get_absolute_url() + '?category=%d' % category.id)

	return direct_to_template(request, 'record/add_category.html')

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
