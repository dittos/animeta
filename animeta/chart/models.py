# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
from work.models import Work
from django.db.models import Count
import datetime
import itertools
import collections

class Ranker(collections.Iterator):
	"""
	Tests for Ranker object.

	A temporary class for the test.

	>>> class f(object):
	...		def __init__(self, factor):
	...			self.factor = factor
	...		def __repr__(self):
	...			return '%d (%d%%)' % (self.factor, self.factor_percent)

	>>> from models import Ranker
	>>> items = f(100), f(100), f(50), f(25), f(25)
	>>> ranker = Ranker(items)
	>>> tuple(ranker)
	((1, 100 (100%)), (1, 100 (100%)), (3, 50 (50%)),
	 (4, 25 (25%)), (4, 25 (25%)))
	"""

	def __init__(self, iterable):
		self.iterable = iter(iterable)
		self.rank = 0
		self.prev = -1
		self.ptr = 1
		self.max = None

	def next(self):
		item = self.iterable.next()
		if self.prev != item.factor:
			self.rank = self.ptr
		self.prev = item.factor
		self.ptr += 1
		if not self.max:
			self.max = item.factor
		item.factor_percent = float(item.factor) / self.max * 100.0
		return (self.rank, item)

class Chart(collections.Iterable):
	def __init__(self, range = None, limit=None):
		self.range = range
		self.limit = limit
		self.queryset = None

	@property
	def start(self):
		return self.range[0]

	@property
	def end(self):
		return self.range[1]

	def __iter__(self):
		if not self.queryset:
			self.queryset = self.get_query_set()[:self.limit]

		return Ranker(self.queryset)

	def get_query_set(self):
		raise NotImplementedError

class PopularWorksChart(Chart):
	title = u'인기 작품'
	def get_query_set(self):
		qs = Work.objects
		if self.range:
			qs = qs.filter(record__updated_at__range=self.range)
		return qs.exclude(title='').annotate(factor=Count('record')).exclude(factor=0).order_by('-factor', 'title')

class ActiveUsersChart(Chart):
	title = u'활발한 사용자'
	def get_query_set(self):
		qs = User.objects
		if self.range:
			qs = qs.filter(history__updated_at__range=self.range)
		return qs.annotate(factor=Count('history')).exclude(factor=0).order_by('-factor', 'username')

def during(**kwargs):
	now = datetime.datetime.now()
	start = now - datetime.timedelta(**kwargs)
	return (start, now)
