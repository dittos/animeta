import datetime
from django.views.generic.simple import direct_to_template
from django.contrib.auth.models import User
from chart.models import weekly, compare_charts, PopularWorksChart, ActiveUsersChart
from record.models import History

def recent(request):
	w = weekly()
	chart = compare_charts(
		PopularWorksChart(w, 5),
		PopularWorksChart(w.prev())
	)
	rows = []
	for row in chart:
		rank = row['rank']
		n = 4 // rank if rank <= 2 else 0
		row['records'] = row['object'].history_set.exclude(comment='')[:n]
		rows.append(row)
	return direct_to_template(request, 'chart/index.html', {
		'weekly_works': rows,
		'weekly_users': ActiveUsersChart(weekly(), 5),
		'newbies': User.objects.filter(date_joined__gte=datetime.date.today()),
		'timeline': History.objects.exclude(comment='')[:6]
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
