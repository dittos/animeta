import datetime

from django.views.generic.simple import direct_to_template
from chart.models import weekly, PopularWorksChart, ActiveUsersChart
from record.models import History
from django.contrib.auth.models import User

def recent(request):
	return direct_to_template(request, 'chart/index.html', {
		'weekly_works': PopularWorksChart(weekly(), 5),
		'weekly_users': ActiveUsersChart(weekly(), 5),
		'newbies': User.objects.filter(date_joined__gte=datetime.date.today()),
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
