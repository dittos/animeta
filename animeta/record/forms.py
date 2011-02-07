# -*- coding: utf-8 -*-

from django import forms
from django.forms.formsets import formset_factory
from record.models import Record, Category, History, StatusTypes
from work.models import Work

class RecordUpdateForm(forms.ModelForm):
	publish = forms.BooleanField(label=u'외부 서비스에 보내기',
			required=False, initial=False)

	def __init__(self, record, *args, **kwargs):
		super(RecordUpdateForm, self).__init__(*args, **kwargs)
		self.record = record

	def save(self):
		history = super(RecordUpdateForm, self).save(commit=False)
		history.user = self.record.user
		history.work = self.record.work
		history.save()
		if self.cleaned_data['publish']:
			from connect import post_history
			post_history(history)
		return history

	class Meta:
		model = History
		widgets = {
			'status': forms.TextInput(attrs={'size': 5}),
			'comment': forms.Textarea(attrs={'rows': 3, 'cols': 40}),
		}
		exclude = ('updated_at', )

class RecordAddForm(RecordUpdateForm):
	category = forms.ModelChoiceField(label=u'분류', empty_label=u'미분류',
			queryset=Category.objects.none(), required=False)
	work_title = forms.CharField(label=u'작품 제목', max_length=100)

	def __init__(self, user, *args, **kwargs):
		super(RecordAddForm, self).__init__(Record(), *args, **kwargs)
		self.fields['category'].queryset = user.category_set.all()
		self.user = user

	def save(self):
		work, created = Work.objects.get_or_create(title=self.cleaned_data['work_title'])
		try:
			self.record = self.user.record_set.get(work=work)
		except:
			self.record = Record(user=self.user, work=work, work_title=work.title)
		self.record.category = self.cleaned_data['category']
		self.record.save()

		super(RecordAddForm, self).save()

class SimpleRecordForm(forms.Form):
	work_title = forms.CharField(max_length=100, widget=forms.TextInput(attrs={'class': 'autocomplete', 'size': 30}))

SimpleRecordFormSet = formset_factory(SimpleRecordForm, extra=12)

class RecordFilterForm(forms.Form):
	type = forms.TypedChoiceField(
		choices = [('', u'전체')] + [(t, t.text) for t in StatusTypes.types],
		coerce = StatusTypes.from_name,
		required = False,
	)
