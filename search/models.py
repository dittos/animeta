# -*- coding: utf-8 -*-
import re
from django.db import models
from work.models import Work

class WorkIndex(models.Model):
    work = models.OneToOneField(Work, primary_key=True, related_name='index')
    title = models.CharField(max_length=100)
    record_count = models.IntegerField()
    rank = models.IntegerField(db_index=True)

class WorkTitleIndex(models.Model):
    key = models.CharField(max_length=255, db_index=True)
    work = models.ForeignKey(WorkIndex)

FIRSTS = u'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
MIDDLES = (u'ㅏ', u'ㅐ', u'ㅑ', u'ㅒ', u'ㅓ', u'ㅔ', u'ㅕ', u'ㅖ', u'ㅗ', u'ㅗㅏ', u'ㅗㅐ', u'ㅗㅣ', u'ㅛ', u'ㅜ', u'ㅜㅓ', u'ㅜㅔ', u'ㅜㅣ', u'ㅠ', u'ㅡ', u'ㅡㅣ', u'ㅣ')
LASTS = (u'', u'ㄱ', u'ㄲ', u'ㄱㅅ', u'ㄴ', u'ㄴㅈ', u'ㄴㅎ', u'ㄷ', u'ㄹ', u'ㄹㄱ', u'ㄹㅁ', u'ㄹㅂ', u'ㄹㅅ', u'ㄹㅌ', u'ㄹㅍ', u'ㄹㅎ', u'ㅁ', u'ㅂ', u'ㅂㅅ', u'ㅅ', u'ㅆ', u'ㅇ', u'ㅈ', u'ㅊ', u'ㅋ', u'ㅌ', u'ㅍ', u'ㅎ')

def _make_key(c):
    if u'가' <= c <= u'힣':
        offset = ord(c) - ord(u'가')
        first = FIRSTS[offset / (len(MIDDLES) * len(LASTS))]
        middle = MIDDLES[(offset / len(LASTS)) % len(MIDDLES)]
        last = LASTS[offset % len(LASTS)]
        return first + middle + last
    elif c.isalnum():
        return c.lower()
    return u''

def make_key(s):
    return u''.join(map(_make_key, s))

def make_regex(q):
    # We don't need to escape the key. Special characters are removed already.
    return '.*' + u'.*'.join(filter(None, map(_make_key, q))) + '.*'

def search_works(q):
    regex = make_regex(q)
    work_ids = WorkTitleIndex.objects.filter(key__regex=regex).values('work_id')
    return WorkIndex.objects.filter(work_id__in=work_ids, record_count__gt=1).order_by('rank')

def suggest_works(q):
    work_ids = WorkTitleIndex.objects.filter(key__startswith=make_key(q)).values('work_id')
    return WorkIndex.objects.filter(work_id__in=work_ids, record_count__gt=1).order_by('rank')
