# -*- coding: utf-8 -*-

from django.shortcuts import *
from django.contrib.auth.models import User

from record.models import StatusTypes
from record.forms import RecordUpdateForm
from connect import get_connected_services

import re
import datetime
import collections

from django import forms
from record.models import Category

def remove_the(string):
    if string[:4].lower() == 'the ':
        string = string[4:]
    return string

def first_alpha(string):
    if not string:
        return '#'

    string = remove_the(string)
    ch = ord(string[0])
    if ch >= 0xAC00 and ch <= 0xD7A3: # 한글
        lead = (ch - 0xAC00) // 588 # 초성 분리
        if lead in (1, 4, 8, 10, 13): # 쌍자음 -> 단자음
            lead -= 1
        return unichr(0xAC00 + lead * 588) # ㄱ -> 가
    elif re.match('^[A-Za-z]', string): # 알파벳
        return string[0].upper() # 대문자
    else: # 나머지
        return '#'

def date_header(time):
    today = datetime.date.today()
    if today.year == time.year:
    	if today.month == time.month:
            return u'이번 달'
        else:
        	return u'%d월' % time.month
    else:
    	return u'%d년 %d월' % (time.year, time.month)

def groupby(iterable, key_func):
    groups = collections.OrderedDict()
    for item in iterable:
    	key = key_func(item)
    	if key not in groups:
    		groups[key] = []
    	groups[key].append(item)
    return groups.iteritems()

class FilterForm(forms.Form):
    category = forms.ModelChoiceField(
        label=u'분류',
        queryset=Category.objects.none(),
        empty_label=u'전체',
        required=False
    )
    sort_by = forms.ChoiceField(
        label=u'정렬 기준',
        choices=(
            ('date', u'날짜'),
            ('title', u'제목')
        ),
        initial='date',
        widget=forms.RadioSelect
    )
    status = forms.MultipleChoiceField(
        label=u'감상 상태',
        choices=(
            ('watching', u'보는 중'),
            ('finished', u'완료'),
            ('suspended', u'중단'),
            ('interested', u'관심 작품'),
        ),
        initial=('watching', 'interested'),
        widget=forms.CheckboxSelectMultiple
    )

    def __init__(self, owner, *args, **kwargs):
        super(FilterForm, self).__init__(*args, **kwargs)
        self.owner = owner
        self.fields['category'].queryset = Category.objects.filter(user=self.owner)

    def get_items(self):
        if not self.is_bound or not self.is_valid():
        	category = None
        	sort_by = self.fields['sort_by'].initial
        	status = self.fields['status'].initial
        else:
        	category = self.cleaned_data['category']
        	sort_by = self.cleaned_data['sort_by']
        	status = self.cleaned_data['status']

        items = self.owner.record_set.filter(
            status_type__in=(StatusTypes.from_name(s) for s in status),
        )
        if category:
        	items = items.filter(category=category)
        if sort_by == 'date':
        	items = items.order_by('-updated_at')
        	group_func = lambda item: date_header(item.updated_at)
        elif sort_by == 'title':
            items = sorted(items, key=lambda item: remove_the(item.title))
            group_func = lambda item: first_alpha(item.title)
        return groupby(items, group_func)

def library(request, username):
    owner = get_object_or_404(User, username=username)
    filter_form = FilterForm(owner, request.GET or None)
    items = filter_form.get_items()
    records = owner.history_set.all()[:10]
    return render(request, 'library/library.html', {
    	'owner': owner,
    	'filter_form': filter_form,
    	'items': items,
    	'records': records,
    })

def item_detail(request, username, id):
    owner = get_object_or_404(User, username=username)
    item = owner.record_set.get(id=id)
    if request.user == owner:
    	form = RecordUpdateForm(item)
    else:
    	form = None
    return render(request, 'library/item_detail.html', {
    	'owner': owner,
    	'item': item,
    	'records': item.history_set,
    	'update_form': form,
    	'connected_services': get_connected_services(owner),
    })
