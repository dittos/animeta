# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_save, post_save, post_delete
from work.models import Work

class StatusType(object):
	def __init__(self, id, text):
		self.id = id
		self.text = text

	def __unicode__(self):
		return self.name
	
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

	def id(self):
		return 0
	
	def name(self):
		return u'미분류'

	def record_set(self):
		return self.user.record_set.filter(category=None)

class Category(models.Model):
	user = models.ForeignKey(User)
	name = models.CharField(max_length=30)
	position = models.PositiveIntegerField()

	class Meta:
		ordering = ('position', 'id')

	def __unicode__(self):
		return self.name

def allocate_next_position(sender, instance, **kwargs):
	max = instance.user.category_set.aggregate(models.Max('position'))['position__max'] or 0
	instance.position = max + 1

pre_save.connect(allocate_next_position, sender=Category)

class Record(models.Model):
	user = models.ForeignKey(User)
	work = models.ForeignKey(Work)
	work_title = models.CharField(max_length=100, null=True)
	status = models.CharField(max_length=30, blank=True)
	status_type = StatusTypeField()
	category = models.ForeignKey(Category, null=True)
	updated_at = models.DateTimeField(null=True)

	@property
	def history_set(self):
		return self.user.history_set.filter(work=self.work)

	@property
	def status_type_name(self):
		return StatusTypes.to_name(self.status_type)
	
	def delete(self, *args, **kwargs):
		self.history_set.delete()
		super(Record, self).delete(*args, **kwargs)

	class Meta:
		unique_together = ('user', 'work')

class History(models.Model):
	user = models.ForeignKey(User, editable=False)
	work = models.ForeignKey(Work, editable=False)
	status = models.CharField(max_length=30, blank=True, verbose_name=u'감상 상태')
	status_type = StatusTypeField()
	comment = models.TextField(blank=True, verbose_name=u'감상평')
	updated_at = models.DateTimeField(auto_now=True, null=True)

	@property
	def record(self):
		return self.user.record_set.get(work=self.work)

	@property
	def status_type_name(self):
		return StatusTypes.to_name(self.status_type)

	class Meta:
		ordering = ['-id']
		get_latest_by = 'updated_at'

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
