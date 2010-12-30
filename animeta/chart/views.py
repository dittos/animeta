import datetime
from django.views.generic.simple import direct_to_template
from django.contrib.auth.models import User
from chart.models import weekly, compare_charts, PopularWorksChart, ActiveUsersChart
from record.models import History

def recent(request):
	return direct_to_template(request, 'chart/index.html', {
		'weekly_works': PopularWorksChart(weekly(), 5),
		'weekly_users': ActiveUsersChart(weekly(), 5),
		'newbies': User.objects.filter(date_joined__gte=datetime.date.today()),
		'timeline': History.objects.exclude(comment='')[:10]
	})

def detail(request, chart_class, range_class=None, title=''):
	if range_class:
		range = range_class.last()
		chart = compare_charts(chart_class(range), chart_class(range.prev()))
	else:
		range = None
		chart = chart_class()

	return direct_to_template(request, 'chart/detail.html', {
		'title': title,
		'chart': chart,
		'cache_key': str(chart_class) + '_' + repr(range),
		'has_diff': range != None,
	})
