# -*- coding: utf-8 -*-
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'animeta.settings'
import sys
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/../..'))
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/..'))

from django.conf import settings
from django.db import transaction, models, IntegrityError
from django.contrib.auth.models import User
from record.models import Record, History
from work.models import TitleMapping, Work

def fallback(s): return s.encode('utf-8', 'replace')

mappings = TitleMapping.objects.all()
grouped = {}
for mapping in mappings:
    key = mapping.key
    if key not in grouped:
        grouped[key] = set()
    grouped[key].add(mapping.work_id)

pop = {}
title = {}
works = {}
for work in Work.objects.annotate(count=models.Count('record')):
    pop[work.id] = work.count
    title[work.id] = work.title
    works[work.id] = work

for key, work_ids in grouped.iteritems():
    if len(work_ids) <= 1:
        continue

    if u'오쟈마녀' in key or u'꼬마마법사레미' in key: continue

    ids = list(work_ids)
    ids.sort(key=lambda id: pop[id], reverse=True)
    #print fallback(title[ids[0]]), fallback(title[ids[1]]), '... %d => %d' % (len(ids), sum(pop[id] for id in ids))
    w = [works[id] for id in ids]

    try:
        with transaction.commit_on_success():
            TitleMapping.objects.filter(key=key).update(work=works[ids[0]])
            Record.objects.filter(work__in=w).update(work=works[ids[0]])
            History.objects.filter(work__in=w).update(work=works[ids[0]])
    except IntegrityError, e:
        for u in User.objects.filter(record__work__in=w).annotate(count=models.Count('record__work')).filter(count__gt=1):
            with transaction.commit_on_success():
                r = u.record_set.filter(work__in=w).latest('updated_at')
                u.record_set.filter(work__in=w).delete()
                u.history_set.filter(work__in=w).update(work=works[ids[0]])
                u.record_set.create(work=works[ids[0]], title=r.title, status=r.status, status_type=r.status_type, category=r.category, updated_at=r.updated_at)
        print ', '.join([fallback(title[id]) for id in ids])
