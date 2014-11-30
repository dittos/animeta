# -*- coding: utf-8 -*-
import string
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_save, post_save, post_delete
from queryset_transform import TransformManager
from work.models import Work, get_or_create_work

class StatusType(object):
    def __init__(self, id, text):
        self.id = id
        self.text = text

    def __unicode__(self):
        return self.name

    def __eq__(self, other):
        if isinstance(other, str) or isinstance(other, unicode):
        	return self.name == other
        elif hasattr(other, 'name'):
        	return self.name == other.name
        else:
        	return False

    def __ne__(self, other):
        return not (self == other)
    
def organize_types(name, bases, dict):
    types = []
    for k, v in dict.iteritems():
        if isinstance(v, StatusType):
            v.name = k.lower()
            types.append(v)
    types.sort(key=lambda t: t.id)
    dict['types'] = types

    return type(name, bases, dict)

class StatusTypes:
    Finished = StatusType(0, u'완료')
    Watching = StatusType(1, u'보는 중')
    Suspended = StatusType(2, u'중단')
    Interested = StatusType(3, u'볼 예정')

    __metaclass__ = organize_types

    @staticmethod
    def to_name(t):
        if isinstance(t, StatusType):
            return t.name
        elif isinstance(t, int):
            return StatusTypes.from_id(t).name

    @staticmethod
    def from_id(id):
        return StatusTypes.types[id]

    @staticmethod
    def from_name(name):
        t = getattr(StatusTypes, name.capitalize(), None)
        if t is None or t.name != name:
            return None
        else:
            return t

from record.fields import StatusTypeField # circular dependency

class Uncategorized(object):
    def __init__(self, user):
        self.user = user

    @property
    def id(self):
        return 0
    
    @property
    def name(self):
        return u'미분류'

    @property
    def record_set(self):
        return self.user.record_set.filter(category=None)
    
    @property
    def record_count(self):
        return self.record_set.count()

class Category(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=30)
    position = models.PositiveIntegerField()

    class Meta:
        ordering = ('position', 'id')

    def __unicode__(self):
        return self.name

def allocate_next_position(sender, instance, **kwargs):
    if instance.id is None:
        max = instance.user.category_set.aggregate(models.Max('position'))['position__max'] or 0
        instance.position = max + 1

pre_save.connect(allocate_next_position, sender=Category)

class Record(models.Model):
    user = models.ForeignKey(User)
    work = models.ForeignKey(Work)
    title = models.CharField(max_length=100)
    status = models.CharField(max_length=30, blank=True)
    status_type = StatusTypeField()
    category = models.ForeignKey(Category, null=True)
    updated_at = models.DateTimeField(null=True)

    @property
    def history_set(self):
        return History.objects.filter(user=self.user, work=self.work)

    @property
    def status_type_name(self):
        return StatusTypes.to_name(self.status_type)

    def has_newer_episode(self):
        if self.status_type != StatusTypes.Watching:
            return False

        try:
            n = int(self.status)
            return History.objects.filter(work=self.work, status=str(n+1), updated_at__gt=self.updated_at).count() > 0
        except ValueError:
            return False
    
    def delete(self, *args, **kwargs):
        self.history_set.delete()
        super(Record, self).delete(*args, **kwargs)
    
    def update_title(self, title):
        work = get_or_create_work(title)
        self.history_set.update(work=work)
        self.work = work
        self.title = title
        self.save()

    def get_status_display(self):
        status = self.status.strip()
        if status and status[-1] in string.digits:
            status += u'화'
        return status

    class Meta:
        unique_together = ('user', 'work')

class History(models.Model):
    user = models.ForeignKey(User, editable=False)
    work = models.ForeignKey(Work, editable=False)
    status = models.CharField(max_length=30, blank=True, verbose_name=u'감상 상태')
    status_type = StatusTypeField()
    comment = models.TextField(blank=True, verbose_name=u'감상평')
    updated_at = models.DateTimeField(auto_now=True, null=True)

    objects = TransformManager()

    @property
    def record(self):
        if not hasattr(self, '_record'):
            return self.user.record_set.get(work=self.work)
        else:
            return self._record

    @property
    def status_type_name(self):
        return StatusTypes.to_name(self.status_type)

    def get_status_display(self):
        status = self.status.strip()
        if status and status[-1] in string.digits:
            status += u'화'
        return status

    def deletable_by(self, user):
        return self.user == user and self.record.history_set.count() > 1 # XXX: N+1 query problem

    class Meta:
        ordering = ['-id']
        get_latest_by = 'updated_at'

def include_records(qs):
    user_ids = set(history.user_id for history in qs)
    work_ids = set(history.work_id for history in qs)
    records = Record.objects.filter(user__in=user_ids, work__in=work_ids)
    dict = {}
    for record in records:
        dict[(record.user_id, record.work_id)] = record
    for history in qs:
        history._record = dict[(history.user_id, history.work_id)]

def sync_record(sender, instance, **kwargs):
    record, created = Record.objects.get_or_create(user=instance.user, work=instance.work)
    if not created:
        try:
            history = record.history_set.latest()
        except History.DoesNotExist:
            return
    else:
        history = instance
    record.status = history.status
    record.status_type = history.status_type
    record.updated_at = history.updated_at
    record.save()

post_save.connect(sync_record, sender=History)
post_delete.connect(sync_record, sender=History)

def get_episodes(work, include_without_comment=False):
    q = list(work.history_set.exclude(comment='')
            .order_by('status').values('status')
            .annotate(models.Count('status')))
    if include_without_comment:
        q2 = (work.history_set.filter(comment='')
                .order_by('status').values('status')
                .annotate(models.Count('status')))
        q += [row for row in q2 if row['status__count'] >= 2]
    result = set()
    for row in q:
        try:
            episode = int(row['status'])
        except ValueError:
            continue
        result.add(episode)
    return sorted(list(result))
