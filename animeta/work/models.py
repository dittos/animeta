from django.db import models
import unicodedata
import re

def normalize_title(title):
	title = re.sub('-(.+?)-', '', title)
	normalized = u''
	for char in title:
		if unicodedata.category(char)[0] in 'LN':
			normalized += char
	return normalized.lower()

class Work(models.Model):
	title = models.CharField(max_length=100, unique=True)
	normalized_title = models.CharField(max_length=100)

	@property
	def popularity(self):
		from record.models import Record
		return self.normalized_set(Record).count()

	def normalized_set(self, model):
		return model.objects.filter(work__normalized_title=self.normalized_title)

	def save(self, force_insert=False, force_update=False):
		if not self.normalized_title:
			self.normalized_title = normalize_title(self.title)

		super(Work, self).save(force_insert, force_update)

	@models.permalink
	def get_absolute_url(self):
		return ('work.views.detail', (), {'title': self.title})
