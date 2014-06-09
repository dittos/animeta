from django.core.management.base import BaseCommand, CommandError
from django.db import transaction, models
from work.models import Work, TitleMapping
from search.models import WorkIndex, WorkTitleIndex, make_key

def add_ranks(objects):
    objects.sort(key=lambda obj: obj.record_count, reverse=True)
    rank = 0
    prev = -1
    for i, obj in enumerate(objects):
        if prev != obj.record_count:
            rank = i + 1
        prev = obj.record_count
        obj.rank = rank

class Command(BaseCommand):
    help = 'Build search index'

    def handle(self, *args, **options):
        with transaction.atomic():
            WorkIndex.objects.all().delete()

            objects = []
            for work in Work.objects.annotate(record_count=models.Count('record')):
                objects.append(WorkIndex(
                    work_id=work.id,
                    title=work.title,
                    record_count=work.record_count,
                ))
            add_ranks(objects)
            WorkIndex.objects.bulk_create(objects)

            objects = []
            for mapping in TitleMapping.objects.all():
                objects.append(WorkTitleIndex(
                    key=make_key(mapping.title),
                    work_id=mapping.work_id,
                ))
            WorkTitleIndex.objects.bulk_create(objects)
