import urllib
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.db import models
from django.views.generic import list_detail
from django.views.generic.simple import direct_to_template
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from work.models import Work, MergeRequest
from record.models import Record, History

def old_url(request, remainder):
	return HttpResponseRedirect('/works/' + urllib.quote(remainder.encode('UTF-8')))

def _get_record(request, work):
	if request.user.is_authenticated():
		try:
			record = request.user.record_set.get(work=work)
		except:
			record = None
	else:
		record = None
	return record

def detail(request, title):
	work = get_object_or_404(Work, title=title)

	N = 6
	history = work.history_set.all().select_related('user')
	comments = list(history.exclude(comment='')[:N])
	if len(comments) < N:
		comments += list(history.filter(comment='')[:N-len(comments)])
	return direct_to_template(request, "work/work_detail.html", {
		'work': work,
		'record': _get_record(request, work),
		'records': work.record_set,
		'similar_works': work.similar_objects[:7],
		'comments': comments,
		'daum_api_key': settings.DAUM_API_KEY
	})

def list_users(request, title):
	work = get_object_or_404(Work, title=title)
	return direct_to_template(request, "work/users.html", {
		'work': work,
		'record': _get_record(request, work),
		'records': work.record_set.order_by('status_type', 'user__username')
	})

def video(request, title, provider, id):
	work = get_object_or_404(Work, title=title)

	return direct_to_template(request, "work/video.html", {
		'work': work,
		'record': _get_record(request, work),
		'records': work.record_set,
		'video_id': id
	})

def search(request):
	keyword = request.GET.get('keyword', '')
	return list_detail.object_list(request,
		queryset = Work.objects.filter(title__icontains=keyword),
		extra_context = {'keyword': keyword},
	)

def merge_dashboard(request):
	return direct_to_template(request, 'work/merge_dashboard.html', {
		'contributors': User.objects.annotate(count=models.Count('mergerequest')).order_by('-count').exclude(count=0)
	})

@login_required
@require_http_methods(['POST'])
def request_merge(request, title, id):
	work = get_object_or_404(Work, title=title)

	if request.method == 'POST':
		source = get_object_or_404(Work, id=id)
		try:
			req, created = MergeRequest.objects.get_or_create(user=request.user, source=source, target=work)
			if created:
				return HttpResponse("merged")
			else:
				req.delete()
				return HttpResponse("cancelled")
		except:
			return HttpResponse("fail")
