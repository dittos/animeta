# -*- coding: utf-8 -*-
from django.conf import settings
from django.http import HttpResponseRedirect
from django.views.generic.simple import direct_to_template
from django.contrib.auth.decorators import login_required
from connect import get_connected_services
from connect.models import Me2Setting, TwitterSetting

import me2day as me2
try:
	import tweepy
except:
	pass

@login_required
def services(request):
	return direct_to_template(request, 'connect/services.html', {
		'services': [service.name.lower() for (service, _) in get_connected_services(request.user)]
	})

@login_required
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

@login_required
def me2day_disconnect(request):
	if request.method == 'POST':
		setting = Me2Setting.objects.get(user=request.user)
		setting.delete()
		request.user.message_set.create(message='인증 정보를 삭제하였습니다.')
		return HttpResponseRedirect('/connect/me2day/')

@login_required
def twitter(request):
	try:
		setting = TwitterSetting.objects.get(user=request.user)
		return direct_to_template(request, 'connect/twitter.html')
	except TwitterSetting.DoesNotExist:
		auth = tweepy.OAuthHandler(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)

		if 'request_token' in request.session:
			token = request.session['request_token']
			del request.session['request_token']
			auth.set_request_token(*token)
			auth.get_access_token(request.GET.get('oauth_verifier'))

			TwitterSetting.objects.create(
				user=request.user, key=auth.access_token.key,
				secret=auth.access_token.secret)
			return HttpResponseRedirect('/connect/twitter/')
		else:
			redirect_url = auth.get_authorization_url()
			request.session['request_token'] = (auth.request_token.key, auth.request_token.secret)
			return HttpResponseRedirect(redirect_url)

@login_required
def twitter_disconnect(request):
	if request.method == 'POST':
		setting = TwitterSetting.objects.get(user=request.user)
		setting.delete()
		request.user.message_set.create(message='인증 정보를 삭제하였습니다.')
		return HttpResponseRedirect('/connect/')
