# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from work.models import Work

class StatusTypes:
	Finished = 0
	Watching = 1
	Suspended = 2
	Interested = 3

STATUS_TYPE_CHOICES = (
	(StatusTypes.Finished, u'완료'),
	(StatusTypes.Watching, u'보는 중'),
	(StatusTypes.Suspended, u'중단'),
	(StatusTypes.Interested, u'볼 예정'),
)
STATUS_TYPE_NAMES = dict(STATUS_TYPE_CHOICES)

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

from django.db.models.signals import pre_save
from record.models import Category

def allocate_next_position(sender, instance, **kwargs):
	max = instance.user.category_set.aggregate(models.Max('position'))['position__max'] or 0
	instance.position = max + 1

pre_save.connect(allocate_next_position, sender=Category)

class Record(models.Model):
	user = models.ForeignKey(User)
	work = models.ForeignKey(Work)
	status = models.CharField(max_length=30, blank=True)
	status_type = models.SmallIntegerField(choices=STATUS_TYPE_CHOICES, default=StatusTypes.Watching)
	category = models.ForeignKey(Category, null=True)
	updated_at = models.DateTimeField(auto_now=True)

	@property
	def history_set(self):
		return self.user.history_set.filter(work=self.work)

	def save(self, comment = '', *args, **kwargs):
		super(Record, self).save(*args, **kwargs)

		# delete previous history if just comment is changed
		try:
			prev = self.history_set.latest('updated_at')
			if prev.status == self.status and not prev.comment.strip():
				prev.delete()
		except History.DoesNotExist:
			pass

		return History.objects.create(
			work = self.work,
			user = self.user,
			status = self.status,
			status_type = self.status_type,
			comment = comment,
			updated_at = self.updated_at
		)

	class Meta:
		unique_together = ('user', 'work')

class History(models.Model):
	user = models.ForeignKey(User, editable=False)
	work = models.ForeignKey(Work, editable=False)
	status = models.CharField(max_length=30, blank=True, verbose_name=u'감상 상태')
	status_type = models.SmallIntegerField(choices=STATUS_TYPE_CHOICES, default=StatusTypes.Watching)
	comment = models.TextField(blank=True, verbose_name=u'감상평')
	updated_at = models.DateTimeField(auto_now=True)

	@property
	def record(self):
		return self.user.record_set.get(work=self.work)

	class Meta:
		ordering = ['-id']
