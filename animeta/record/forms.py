# -*- coding: utf-8 -*-

from django import forms
from django.forms.formsets import formset_factory
from record.models import Record, Category, History
from work.models import Work

class RecordUpdateForm(forms.ModelForm):
	publish = forms.BooleanField(label=u'외부 서비스에 보내기',
			required=False, initial=False)

	def __init__(self, record, data=None, initial={}):
		super(RecordUpdateForm, self).__init__(data, instance=record, initial=initial)
		self.record = record

	def save(self):
		self.record.status = self.cleaned_data['status']
		self.record.status_type = self.cleaned_data['status_type']
		history = self.record.save(comment=self.cleaned_data['comment'])

		if self.cleaned_data['publish']:
			from connect import post_history
			post_history(history)

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

	def __init__(self, user, data=None, initial={}):
		super(RecordAddForm, self).__init__(Record(user=user),
				data=data, initial=initial)
		self.fields['category'].queryset = user.category_set.all()
		self.user = user

	def save(self):
		work, created = Work.objects.get_or_create(title=self.cleaned_data['work_title'])
		try:
			self.record = self.user.record_set.get(work=work)
		except:
			self.record = Record(user=self.user, work=work)
		self.record.category = self.cleaned_data['category']
		RecordUpdateForm.save(self)

class SimpleRecordForm(forms.Form):
	work_title = forms.CharField(max_length=100, widget=forms.TextInput(attrs={'class': 'autocomplete', 'size': 30}))

SimpleRecordFormSet = formset_factory(SimpleRecordForm, extra=12)
