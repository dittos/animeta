# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from animeta.work.models import Work

class Record(models.Model):
	user = models.ForeignKey(User)
	work = models.ForeignKey(Work)
	status = models.CharField(max_length=30, blank=True)
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
