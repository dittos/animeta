# -*- coding: utf-8 -*-

from django import forms
from django.forms.formsets import formset_factory

class SimpleRecordForm(forms.Form):
    work_title = forms.CharField(max_length=100, widget=forms.TextInput(attrs={'class': 'autocomplete', 'size': 30}))

SimpleRecordFormSet = formset_factory(SimpleRecordForm, extra=12)
