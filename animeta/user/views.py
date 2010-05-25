from django.shortcuts import get_object_or_404
from django.views.generic.simple import direct_to_template
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from django.views.decorators.csrf import csrf_protect

@csrf_protect
def welcome(request):
	if request.user.is_authenticated():
		return HttpResponseRedirect('/recent/')
	else:
		from chart.models import during, PopularWorksChart
		return direct_to_template(request, 'welcome.html', {
			'weekly_works': PopularWorksChart(during(weeks=1), 5)
		})

@csrf_protect
def login(request):
	import django.contrib.auth.views
	if request.POST.has_key('remember'):
		request.session.set_expiry(3600 * 24 * 14)
	else:
		request.session.set_expiry(0)
	return django.contrib.auth.views.login(request)

@csrf_protect
def signup(request):
	from django.contrib.auth.forms import UserCreationForm
	if request.method == 'POST':
		form = UserCreationForm(request.POST)
		if form.is_valid():
			user = form.save()
			from django.contrib.auth import login
			user.backend = 'django.contrib.auth.backends.ModelBackend'
			login(request, user)
			request.session.set_expiry(0)
			return HttpResponseRedirect('/accounts/profile/')
	else:
		form = UserCreationForm()

	return direct_to_template(request, 'registration/signup.html', {'form': form})

def shortcut(request, username):
	user = get_object_or_404(User, username=username)
	return HttpResponseRedirect('/users/%s/' % username)

def library(request, username):
	from record.models import Uncategorized
	if not username and request.user.is_authenticated():
		return HttpResponseRedirect(request.user.get_absolute_url())

	user = get_object_or_404(User, username=username)
	records = user.record_set
	record_count = records.count()
	hide_finished = request.GET.get('finished') == 'hide'
	if hide_finished:
		records = records.exclude(status='')
	category_filter = None
	if 'category' in request.GET:
		category_filter = int(request.GET['category'])
		records = records.filter(category=category_filter or None)

	return direct_to_template(request, 'user/library.html', {
		'owner': user,
		'records': records.select_related('work', 'user').order_by('work__title'),
		'categories': [Uncategorized(user)] + list(user.category_set.all()),
		'record_count': record_count,
		'finished_count': user.record_set.filter(status='').count(),
		'hide_finished': hide_finished,
		'category_filter': category_filter
	})

def history(request, username):
	from django.views.generic import list_detail
	user = get_object_or_404(User, username=username)
	return list_detail.object_list(request,
		template_name = 'user/history.html',
		queryset = user.history_set.select_related('work', 'user'),
		paginate_by = 8,
		extra_context = {'owner': user}
	)

def history_feed(request, username):
	from django.views.generic import list_detail
	user = get_object_or_404(User, username=username)
	return list_detail.object_list(request,
		template_name = 'user/history.atom',
		queryset = user.history_set.select_related('work', 'user'),
		paginate_by = 20,
		extra_context = {'owner': user},
		mimetype = 'application/atom+xml'
	)
