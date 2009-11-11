# -*- coding: utf-8 -*-

from django import forms
from record.models import Record, Category

class RecordForm(forms.Form):
	work_title = forms.CharField(label=u'작품 제목', max_length=100)
	status = forms.CharField(label=u'감상 상태', max_length=30, required=False,
			widget=forms.TextInput(attrs={'size': 5}))
	comment = forms.CharField(label=u'감상평', required=False,
			widget=forms.Textarea(attrs={'rows': 3, 'cols': 40}))
	category = forms.ModelChoiceField(label=u'분류', empty_label=u'미분류',
			queryset=Category.objects.none(), required=False)
	me2day_send = forms.BooleanField(label=u'미투데이에 보내기',
			required=False, initial=True)

class SimpleRecordForm(forms.Form):
	work_title = forms.CharField(max_length=100, widget=forms.TextInput(attrs={'class': 'autocomplete', 'size': 30}))

from django.forms.formsets import formset_factory
SimpleRecordFormSet = formset_factory(SimpleRecordForm, extra=12)
