# -*- coding: utf-8 -*-

from django.conf.urls.defaults import *
from chart.models import weekly, monthly, PopularWorksChart, ActiveUsersChart

chart_types = (
	('works', PopularWorksChart),
	('users', ActiveUsersChart),
)

ranges = (
	('overall', '', None),
	('weekly', u'주간', weekly()),
	('monthly', u'월간', monthly()),
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
