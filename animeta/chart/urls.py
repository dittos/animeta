# -*- coding: utf-8 -*-

from django.conf.urls.defaults import *
from chart.models import *

chart_types = (
	('works', PopularWorksChart),
	('users', ActiveUsersChart),
)

ranges = (
	('overall', '', None, None),
	('weekly', u'주간', weekly(), past_week()),
	('monthly', u'월간', monthly(), past_month()),
)

urlpatterns = patterns('chart.views', *(
	(r'^%s/%s/' % (chart_url, range_url), 'detail', {
		'title': (range_name + u' ' + chart_class.title).strip(),
		'chart_class': chart_class,
		'range': range,
		'past_range': past_range,
	})
	for (chart_url, chart_class) in chart_types
	for (range_url, range_name, range, past_range) in ranges
))
