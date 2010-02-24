# -*- coding: utf-8 -*-

from django import forms
from record.models import Record, Category
from work.models import Work

class RecordUpdateForm(forms.Form):
	status = forms.CharField(label=u'감상 상태', max_length=30, required=False,
			widget=forms.TextInput(attrs={'size': 5}))
	comment = forms.CharField(label=u'감상평', required=False,
			widget=forms.Textarea(attrs={'rows': 3, 'cols': 40}))
	category = forms.ModelChoiceField(label=u'분류', empty_label=u'미분류',
			queryset=Category.objects.none(), required=False)
	me2day_send = forms.BooleanField(label=u'미투데이에 보내기',
			required=False, initial=True)

	def save(self, record):
		record.status = self.cleaned_data['status']
		record.category = self.cleaned_data['category']
		record.save()

		# delete previous history if just comment is changed
		prev = record.history_set.latest('updated_at')
		if prev.status == self.cleaned_data['status'] and not prev.comment.strip():
			prev.delete()

		history = record.user.history_set.create(
			work = record.work,
			user = record.user,
			status = record.status,
			comment = self.cleaned_data['comment'],
			updated_at = record.updated_at
		)

		if self.cleaned_data['me2day_send']:
			import connect.me2day
			connect.me2day.post_history(history)

class RecordAddForm(RecordUpdateForm):
	work_title = forms.CharField(label=u'작품 제목', max_length=100)

	def save(self, user):
		work, created = Work.objects.get_or_create(title=self.cleaned_data['work_title'])
		try:
			record = user.record_set.get(work=work)
		except:
			record = Record(user=user, work=work)
		RecordUpdateForm.save(self, record)

class SimpleRecordForm(forms.Form):
	work_title = forms.CharField(max_length=100, widget=forms.TextInput(attrs={'class': 'autocomplete', 'size': 30}))

from django.forms.formsets import formset_factory
SimpleRecordFormSet = formset_factory(SimpleRecordForm, extra=12)
