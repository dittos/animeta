# -*- coding: utf-8 -*-
from django.conf import settings
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from connect.models import Me2Setting, TwitterSetting, FacebookSetting

import tweepy
import facebook as fb

@login_required
def twitter(request):
    try:
        setting = TwitterSetting.objects.get(user=request.user)
        return redirect('/settings/')
    except TwitterSetting.DoesNotExist:
        pass

    auth = tweepy.OAuthHandler(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)

    if 'request_token' in request.session:
        token = request.session['request_token']
        del request.session['request_token']
        auth.set_request_token(*token)
        try:
            auth.get_access_token(request.GET.get('oauth_verifier'))

            TwitterSetting.objects.create(
                user=request.user, key=auth.access_token.key,
                secret=auth.access_token.secret)
            if request.session['popup']:
                js = 'opener.onTwitterConnect(true); window.close()'
                return HttpResponse('<script>%s</script>' % js)
            else:
                return redirect('/settings/')
        except tweepy.TweepError:
            pass

    popup = request.GET.get('popup') == 'true'
    try:
        redirect_url = auth.get_authorization_url()
        request.session['request_token'] = (auth.request_token.key, auth.request_token.secret)
        request.session['popup'] = popup
        return redirect(redirect_url)
    except tweepy.TweepError:
        if popup:
            js = 'opener.onTwitterConnect(false); window.close()'
            return HttpResponse('<script>%s</script>' % js)
        else:
            messages.error(request, u'인증에 실패했습니다. 잠시 후 다시 시도해주세요.')
            return redirect('/settings/')

@login_required
def twitter_disconnect(request):
    if request.method == 'POST':
        setting = TwitterSetting.objects.get(user=request.user)
        setting.delete()
        messages.success(request, u'인증 정보를 삭제하였습니다.')
        return redirect('/settings/')

@login_required
def facebook(request):
    try:
        setting = FacebookSetting.objects.get(user=request.user)
        return redirect('/settings/')
    except FacebookSetting.DoesNotExist:
        pass

    FacebookSetting.objects.create(user=request.user, key=request.POST['token'])
    if not request.is_ajax:
        messages.success(request, u'연동에 성공했습니다.')
    return redirect('/settings/')

@login_required
def facebook_disconnect(request):
    if request.method == 'POST':
        setting = FacebookSetting.objects.get(user=request.user)
        setting.delete()
        messages.success(request, u'인증 정보를 삭제하였습니다.')
        return redirect('/settings/')
