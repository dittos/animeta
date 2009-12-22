from django.views.generic.simple import direct_to_template
from chart.models import during, PopularWorksChart, EnthusiastsChart
from record.models import History
from django.contrib.auth.models import User

def recent(request):
	return direct_to_template(request, 'chart/index.html', {
		'weekly_works': PopularWorksChart(during(weeks=1), 5),
		'weekly_users': EnthusiastsChart(during(weeks=1), 5),
		'newbies': User.objects.filter(date_joined__range=during(days=1)),
		'timeline': History.objects.exclude(comment='').all()[:10]
	})

def detail(request, chart_class, range = None, title = ''):
	chart = chart_class(range)
	return direct_to_template(request, 'chart/detail.html', {
		'title': title,
		'chart': chart,
		'cache_key': str(chart_class) + '_' + repr(range),
		'range': range
	})
