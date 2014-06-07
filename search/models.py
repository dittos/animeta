# -*- coding: utf-8 -*-
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

def make_key(s):
    result = u''
    for c in s.lower():
        if u'가' <= c <= u'힣':
            offset = ord(c) - ord(u'가')
            first = FIRSTS[offset / (len(MIDDLES) * len(LASTS))]
            middle = MIDDLES[(offset / len(LASTS)) % len(MIDDLES)]
            last = LASTS[offset % len(LASTS)]
            result += first + middle + last
        elif c.isalnum():
            result += c
    return result
