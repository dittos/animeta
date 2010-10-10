from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_protect
from django.views.generic import list_detail
from django.views.generic.simple import direct_to_template
from django.contrib.auth import login as _login
from django.contrib.auth.models import User
from django.contrib.auth.views import login as login_view
from django.contrib.auth.forms import UserCreationForm
from chart.models import weekly, PopularWorksChart
from record.models import Uncategorized, StatusTypes

@csrf_protect
def welcome(request):
	if request.user.is_authenticated():
		return HttpResponseRedirect('/recent/')
	else:
		return direct_to_template(request, 'welcome.html', {
			'weekly_works': PopularWorksChart(weekly(), 5)
		})

@csrf_protect
def login(request):
	if request.POST.has_key('remember'):
		request.session.set_expiry(3600 * 24 * 14)
	else:
		request.session.set_expiry(0)
	return login_view(request)

@csrf_protect
def signup(request):
	if request.method == 'POST':
		form = UserCreationForm(request.POST)
		if form.is_valid():
			user = form.save()
			user.backend = 'django.contrib.auth.backends.ModelBackend'
			_login(request, user)
			request.session.set_expiry(0)
			return HttpResponseRedirect('/accounts/profile/')
	else:
		form = UserCreationForm()

	return direct_to_template(request, 'registration/signup.html', {'form': form})

def shortcut(request, username):
	user = get_object_or_404(User, username=username)
	return HttpResponseRedirect('/users/%s/' % username)

def library(request, username):
	if not username and request.user.is_authenticated():
		return HttpResponseRedirect(request.user.get_absolute_url())

	user = get_object_or_404(User, username=username)
	records = user.record_set
	record_count = records.count()

	hide_finished = request.GET.get('finished') == 'hide'
	if hide_finished:
		records = records.filter(status_type=StatusTypes.Watching)

	category_filter = None
	if request.GET.get('category'):
		try:
			category_filter = int(request.GET['category'])
			records = records.filter(category=category_filter or None)
		except:
			pass

	return direct_to_template(request, 'user/library.html', {
		'owner': user,
		'records': records.select_related('work', 'user').order_by('work__title'),
		'categories': [Uncategorized(user)] + list(user.category_set.all()),
		'record_count': record_count,
		'finished_count': user.record_set.filter(status='').count(),
		'hide_finished': hide_finished,
		'category_filter': category_filter,
	})

def history(request, username):
	user = get_object_or_404(User, username=username)
	return list_detail.object_list(request,
		template_name = 'user/history.html',
		queryset = user.history_set.select_related('work', 'user'),
		paginate_by = 8,
		extra_context = {'owner': user}
	)

def history_feed(request, username):
	user = get_object_or_404(User, username=username)
	return list_detail.object_list(request,
		template_name = 'user/history.atom',
		queryset = user.history_set.select_related('work', 'user'),
		paginate_by = 20,
		extra_context = {'owner': user},
		mimetype = 'application/atom+xml'
	)
