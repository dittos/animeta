# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from animeta.work.models import Work

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
	title = models.CharField(max_length=100)
	status = models.CharField(max_length=30, blank=True)
	category = models.ForeignKey(Category, null=True)
	updated_at = models.DateTimeField(auto_now=True)

	@property
	def history_set(self):
		return self.user.history_set.filter(work=self.work)

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
