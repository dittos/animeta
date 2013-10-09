# -*- coding: utf-8 -*-
from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from connect import get_connected_services
from connect.models import Me2Setting, TwitterSetting, FacebookSetting

import tweepy
import facebook as fb

@login_required
def services(request):
    return render(request, 'connect/services.html', {
        'services': get_connected_services(request.user),
    })

@login_required
def twitter(request):
    try:
        setting = TwitterSetting.objects.get(user=request.user)
        return render(request, 'connect/twitter.html')
    except TwitterSetting.DoesNotExist:
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
                return redirect('/connect/twitter/')
            except tweepy.TweepError:
                pass

        redirect_url = auth.get_authorization_url()
        request.session['request_token'] = (auth.request_token.key, auth.request_token.secret)
        return redirect(redirect_url)

@login_required
def twitter_disconnect(request):
    if request.method == 'POST':
        setting = TwitterSetting.objects.get(user=request.user)
        setting.delete()
        messages.success(request, u'인증 정보를 삭제하였습니다.')
        return redirect('/connect/')

@login_required
def facebook(request):
    user = None
    try:
        setting = FacebookSetting.objects.get(user=request.user)
        user = True
    except FacebookSetting.DoesNotExist:
        pass

    if request.method == 'POST':
        user = fb.get_user_from_cookie(request.COOKIES, settings.FACEBOOK_API_ID, settings.FACEBOOK_API_SECRET)
        FacebookSetting.objects.create(user=request.user, key=user['access_token'])
        messages.success(request, u'연동에 성공했습니다.')

    return render(request, 'connect/facebook.html', {'app_id': settings.FACEBOOK_API_ID, 'fb_user': user})

@login_required
def facebook_disconnect(request):
    if request.method == 'POST':
        setting = FacebookSetting.objects.get(user=request.user)
        setting.delete()
        messages.success(request, u'인증 정보를 삭제하였습니다.')
        return redirect('/connect/')
