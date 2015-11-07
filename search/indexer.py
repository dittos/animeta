from django.db import transaction, models
from work.models import Work, TitleMapping
from search.models import WorkIndex, WorkTitleIndex, \
    WorkPeriodIndex, make_key


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
    WorkPeriodIndex.objects.all().delete()

    objects = []
    period_objects = []
    for work in Work.objects.annotate(record_count=models.Count('record')):
        objects.append(WorkIndex(
            work_id=work.id,
            title=work.title,
            record_count=work.record_count,
        ))
        metadata = work.metadata
        if metadata:
            is_first = True
            for period in metadata['periods']:
                period_objects.append(WorkPeriodIndex(
                    period=period,
                    work_id=work.id,
                    is_first_period=is_first,
                ))
                is_first = False
    add_ranks(objects)
    WorkIndex.objects.bulk_create(objects)
    WorkPeriodIndex.objects.bulk_create(period_objects)

    objects = []
    for mapping in TitleMapping.objects.all():
        objects.append(WorkTitleIndex(
            key=make_key(mapping.title),
            work_id=mapping.work_id,
        ))
    WorkTitleIndex.objects.bulk_create(objects)
