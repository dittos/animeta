# -*- coding: utf-8 -*-
from django.http import HttpResponseRedirect
from django.views.generic.simple import direct_to_template
from connect.models import Me2Setting
import me2day as me2

def me2day(request):
	status = None

	try:
		setting = Me2Setting.objects.get(user=request.user)
	except:
		setting = None

	if request.method == 'POST':
		setting = Me2Setting(user=request.user, userid=request.POST['me2_userid'], userkey=request.POST['me2_userkey'])
		try:
			me2.call('noop', uid=setting.userid, user_key=setting.userkey)
			setting.save()
			status = 'auth_ok'
		except:
			status = 'auth_fail'
			setting = None
			
	return direct_to_template(request, 'connect/me2day.html', {'status': status, 'setting': setting})

def me2day_disconnect(request):
	if request.method == 'POST':
		setting = Me2Setting.objects.get(user=request.user)
		setting.delete()
		request.user.message_set.create(message='인증 정보를 삭제하였습니다.')
		return HttpResponseRedirect('/connect/me2day/')
