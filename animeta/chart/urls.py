# -*- coding: utf-8 -*-

from django.conf.urls.defaults import *
from chart.models import during, PopularWorksChart, ActiveUsersChart

chart_types = (
	('works', PopularWorksChart),
	('users', ActiveUsersChart),
)

ranges = (
	('overall', '', None),
	('weekly', u'주간', during(weeks=1)),
	('monthly', u'월간', during(days=30)),
)

urlpatterns = patterns('chart.views', *(
	(r'^%s/%s/' % (chart_url, range_url), 'detail', {
		'title': (range_name + u' ' + chart_class.title).strip(),
		'chart_class': chart_class,
		'range': range,
	})
	for (chart_url, chart_class) in chart_types
	for (range_url, range_name, range) in ranges
))
