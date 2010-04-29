from django.db import models

class Work(models.Model):
	title = models.CharField(max_length=100, unique=True)

	@property
	def popularity(self):
		return self.record_set.count()

	@models.permalink
	def get_absolute_url(self):
		return ('work.views.detail', (), {'title': self.title})
