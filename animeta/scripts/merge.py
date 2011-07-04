import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'animeta.settings'
import sys
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/../..'))
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/..'))

from django.conf import settings
from django.db import transaction, models, IntegrityError
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

    ids = list(work_ids)
    ids.sort(key=lambda id: pop[id], reverse=True)
    #print fallback(title[ids[0]]), fallback(title[ids[1]]), '... %d => %d' % (len(ids), sum(pop[id] for id in ids))
    w = [works[id] for id in ids]

    try:
        with transaction.commit_on_success():
            TitleMapping.objects.filter(key=key).update(work=works[ids[0]])
            Record.objects.filter(work__in=w).update(work=works[ids[0]])
            History.objects.filter(work__in=w).update(work=works[ids[0]])
    except IntegrityError:
        print fallback(title[ids[0]])
