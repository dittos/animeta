# -*- coding: utf-8 -*-

from django.conf.urls.defaults import *
from chart.models import during, PopularWorksChart, EnthusiastsChart

urlpatterns = patterns('chart.views',
	(r'^works/overall/', 'detail', {'title': '인기 작품', 'chart_class': PopularWorksChart}),
	(r'^works/weekly/', 'detail', {'title': '주간 인기 작품', 'chart_class': PopularWorksChart, 'range': during(weeks=1)}),
	(r'^works/monthly/', 'detail', {'title': '월간 인기 작품', 'chart_class': PopularWorksChart, 'range': during(days=30)}),
	(r'^users/overall/', 'detail', {'title': '열혈 사용자', 'chart_class': EnthusiastsChart}),
	(r'^users/weekly/', 'detail', {'title': '주간 열혈 사용자', 'chart_class': EnthusiastsChart, 'range': during(weeks=1)}),
	(r'^users/monthly/', 'detail', {'title': '월간 열혈 사용자', 'chart_class': EnthusiastsChart, 'range': during(days=30)}),
)
