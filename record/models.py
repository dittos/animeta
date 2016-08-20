# -*- coding: utf-8 -*-
import enum
from django.db import models
from django.contrib.auth.models import User
from work.models import Work, get_or_create_work


@enum.unique
class StatusType(enum.IntEnum):
    finished = 0
    watching = 1
    suspended = 2
    interested = 3


class Category(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=30)
    position = models.PositiveIntegerField()

    class Meta:
        ordering = ('position', 'id')

    def __unicode__(self):
        return self.name


class Record(models.Model):
    user = models.ForeignKey(User)
    work = models.ForeignKey(Work)
    title = models.CharField(max_length=100)
    status = models.CharField(max_length=30, blank=True)
    status_type = models.SmallIntegerField()
    category = models.ForeignKey(Category, null=True)
    updated_at = models.DateTimeField(null=True)

    def has_newer_episode(self):
        if self.status_type != StatusType.watching:
            return False

        try:
            n = int(self.status)
            return History.objects.filter(
                work_id=self.work_id,
                status=str(n + 1),
                updated_at__gt=self.updated_at
            ).exists()
        except ValueError:
            return False

    def update_title(self, title):
        work = get_or_create_work(title)
        self.history_set.update(work=work)
        self.work = work
        self.title = title
        self.save()

    class Meta:
        unique_together = ('user', 'work')


class History(models.Model):
    user = models.ForeignKey(User, editable=False)
    work = models.ForeignKey(Work, editable=False)
    record = models.ForeignKey(Record)
    status = models.CharField(max_length=30, blank=True)
    status_type = models.SmallIntegerField()
    comment = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    contains_spoiler = models.BooleanField(default=False)

    class Meta:
        ordering = ['-id']
        get_latest_by = 'updated_at'


def get_episodes(work):
    result = {}
    q = (work.history_set.exclude(comment='')
         .order_by('status').values('status')
         .annotate(models.Count('status')))
    for row in q:
        try:
            number = int(row['status'])
        except ValueError:
            continue
        result[number] = {
            'number': number,
            'post_count': row['status__count']
        }
    q2 = (work.history_set.filter(comment='')
          .order_by('status').values('status')
          .annotate(models.Count('status')))
    for row in q2:
        try:
            number = int(row['status'])
        except ValueError:
            continue
        if number in result:
            continue
        if row['status__count'] <= 1:
            continue
        result[number] = {'number': number}
    return sorted(result.values(), key=lambda episode: episode['number'])
