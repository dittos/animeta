# -*- coding: utf-8 -*-

from django import forms
from django.forms.formsets import formset_factory
from record.models import Record, Category, History, StatusTypes
from work.models import Work, TitleMapping, normalize_title, get_or_create_work
from connect import post_history, get_connected_services
from connect.models import FacebookSetting

class RecordUpdateForm(forms.ModelForm):
    publish_twitter = forms.BooleanField(label=u'트위터',
            required=False, initial=False)
    publish_facebook = forms.BooleanField(label=u'페이스북',
            required=False, initial=False)
    fb_token = forms.CharField(widget=forms.HiddenInput, required=False)

    def __init__(self, record, *args, **kwargs):
        if 'initial' not in kwargs:
        	kwargs['initial'] = {}
        kwargs['initial']['status'] = record.status
        kwargs['initial']['status_type'] = record.status_type
        kwargs['label_suffix'] = ''
        super(RecordUpdateForm, self).__init__(*args, **kwargs)
        self.record = record

    @property
    def connected_services(self):
        return ' '.join(get_connected_services(self.record.user))

    def save(self):
        history = super(RecordUpdateForm, self).save(commit=False)
        history.user = self.record.user
        history.work = self.record.work
        history.save()
        services = []
        if self.cleaned_data['publish_twitter']:
            services.append('twitter')
        if self.cleaned_data['publish_facebook']:
            services.append('facebook')
            token = self.cleaned_data['fb_token']
            if token:
                try:
                    fb = FacebookSetting.objects.get(user=self.record.user)
                except FacebookSetting.DoesNotExist:
                    fb = FacebookSetting(user=self.record.user)
                fb.key = token
                fb.save()

        post_history(history, services)
        return history

    class Meta:
        model = History
        widgets = {
            'status': forms.TextInput(attrs={'size': 5}),
            'comment': forms.Textarea(attrs={'rows': 3, 'cols': 30}),
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

    @property
    def connected_services(self):
        return ' '.join(get_connected_services(self.user))

    def clean_work_title(self):
        title = self.cleaned_data['work_title']
        self.work = get_or_create_work(title)
        try:
            r = self.user.record_set.get(work=self.work)
            raise forms.ValidationError(u'이미 같은 작품이 "%s"로 등록되어 있습니다.' % r.title)
        except Record.DoesNotExist:
            pass
        return title

    def save(self):
        try:
            self.record = self.user.record_set.get(work=self.work)
            raise Exception('Already added')
        except Record.DoesNotExist:
            self.record = Record(user=self.user, work=self.work, title=self.cleaned_data['work_title'])
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
