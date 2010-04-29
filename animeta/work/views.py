from django.shortcuts import get_object_or_404
from django.views.generic.simple import direct_to_template
from work.models import Work
from record.models import Record, History

def old_url(request, remainder):
	from django.http import HttpResponseRedirect
	import urllib
	return HttpResponseRedirect('/works/' + urllib.quote(remainder.encode('UTF-8')))

def detail(request, title):
	work = get_object_or_404(Work, title=title)
	if request.user.is_authenticated():
		try:
			record = request.user.record_set.get(work=work)
		except:
			record = None
	else:
		record = None

	N = 6
	history = work.history_set.all().select_related('user')
	comments = list(history.exclude(comment='')[:N])
	if len(comments) < N:
		comments += list(history.filter(comment='')[:N-len(comments)])

	from django.conf import settings
	return direct_to_template(request, "work/work_detail.html", {
		'work': work,
		'record': record,
		'records': work.record_set,
		'comments': comments,
		'daum_api_key': settings.DAUM_API_KEY
	})

def video(request, title, provider, id):
	work = get_object_or_404(Work, title=title)
	if request.user.is_authenticated():
		try:
			record = request.user.record_set.get(work=work)
		except:
			record = None
	else:
		record = None

	return direct_to_template(request, "work/video.html", {
		'work': work,
		'record': record,
		'records': work.record_set,
		'video_id': id
	})

def search(request):
	from django.views.generic import list_detail

	keyword = request.GET['keyword']
	return list_detail.object_list(request,
		queryset = Work.objects.filter(title__contains=keyword),
		extra_context = {'keyword': keyword},
	)
