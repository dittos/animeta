# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from work.models import Work

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

	def __unicode__(self):
		return self.name

class Record(models.Model):
	user = models.ForeignKey(User)
	work = models.ForeignKey(Work)
	status = models.CharField(max_length=30, blank=True)
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
			comment = comment,
			updated_at = self.updated_at
		)

	class Meta:
		unique_together = ('user', 'work')

class History(models.Model):
	user = models.ForeignKey(User)
	work = models.ForeignKey(Work)
	status = models.CharField(max_length=30, blank=True)
	comment = models.TextField(blank=True)
	updated_at = models.DateTimeField()

	@property
	def record(self):
		return self.user.record_set.get(work=self.work)

	class Meta:
		ordering = ['-id']
