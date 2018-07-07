import collections
from django.db import transaction, models
from work.models import Work, TitleMapping
from search.models import WorkIndex, WorkTitleIndex, \
    WorkAttributeIndex, make_key


def add_ranks(objects):
    objects.sort(key=lambda obj: obj.record_count, reverse=True)
    rank = 0
    prev = -1
    for i, obj in enumerate(objects):
        if prev != obj.record_count:
            rank = i + 1
        prev = obj.record_count
        obj.rank = rank


@transaction.atomic
def run():
    WorkIndex.objects.all().delete()
    WorkAttributeIndex.objects.all().delete()

    objects = []
    attr_objects = []
    attr_map = collections.defaultdict(set)
    for work in Work.objects.annotate(record_count=models.Count('record')):
        objects.append(WorkIndex(
            work_id=work.id,
            title=work.title,
            record_count=work.record_count,
            blacklisted=work.blacklisted,
        ))
        metadata = work.metadata
        if metadata:
            studios = metadata.get('studio')
            if isinstance(studios, basestring):
                studios = [studios]
            if studios:
                studio_set = attr_map['studio']
                for studio in studios:
                    if studio not in studio_set:
                        attr_objects.append(WorkAttributeIndex(key='studio', value=studio))
                        studio_set.add(studio)
            schedule_jp = metadata.get('schedule')
            if schedule_jp:
                if not isinstance(schedule_jp, basestring):
                    if len(schedule_jp) == 2:
                        broadcasts = schedule_jp[1]
                    else:
                        broadcasts = schedule_jp[0]
                    if broadcasts and isinstance(broadcasts, basestring):
                        broadcasts = [broadcasts]
                    broadcast_set = attr_map['broadcast']
                    for broadcast in broadcasts:
                        if broadcast not in broadcast_set:
                            attr_objects.append(WorkAttributeIndex(key='broadcast', value=broadcast))
                            broadcast_set.add(broadcast)

    add_ranks(objects)
    WorkIndex.objects.bulk_create(objects)
    WorkAttributeIndex.objects.bulk_create(attr_objects)

    objects = []
    for mapping in TitleMapping.objects.all():
        objects.append(WorkTitleIndex(
            key=make_key(mapping.title),
            work_id=mapping.work_id,
        ))
    WorkTitleIndex.objects.bulk_create(objects)
