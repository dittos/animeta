from django.db import models

class Work(models.Model):
	title = models.CharField(max_length=100, unique=True)

	@property
	def popularity(self):
		return self.record_set.count()

	@property
	def rank(self):
		from django.db import connection
		cursor = connection.cursor()
		cursor.execute("SELECT rank FROM (SELECT work_id, RANK() OVER (ORDER BY COUNT(*) DESC) AS rank FROM record_record GROUP BY work_id) t WHERE work_id = %s", [self.id])
		return cursor.fetchone()[0]

	def __unicode__(self):
		return self.title

	@models.permalink
	def get_absolute_url(self):
		return ('work.views.detail', (), {'title': self.title})

def suggest_works(query, user=None):
	queryset = Work.objects

	if user and user.is_authenticated():
		queryset = queryset.exclude(id__in=user.record_set.values('work'))

	return queryset.filter(title__istartswith=query)
