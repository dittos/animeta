from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

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
		row = cursor.fetchone()
		return row[0] if row else None

	@property
	def similar_objects(self):
		if settings.DEBUG:
			qs = Work.objects.filter(title__icontains=self.title)
		else:
			qs = Work.objects.extra(
				select={'dist': 'title_distance(%s, title)'},
				select_params=[self.title],
				where=['title_distance(%s, title) <= 0.6'],
				params=[self.title],
				order_by=['dist'])
		return qs.exclude(id=self.id)
	
	def has_merge_request(self):
		return bool(MergeRequest.objects.filter(source=self)) or \
				bool(MergeRequest.objects.filter(target=self))

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

class MergeRequest(models.Model):
	user = models.ForeignKey(User)
	target = models.ForeignKey(Work)
	source = models.ForeignKey(Work, related_name='merge_with')

	@property
	def trivial(self):
		def normalize(str):
			return str.lower().replace(' ', '')
		return normalize(self.target.title) == normalize(self.source.title)

	class Meta:
		unique_together = ('target', 'source')
