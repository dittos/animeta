# -*- coding: utf-8 -*-
import tweepy
from django.conf import settings
from connect.models import TwitterSetting
from record.models import StatusTypes


def get_api(setting):
    auth = tweepy.OAuthHandler(
        settings.TWITTER_CONSUMER_KEY,
        settings.TWITTER_CONSUMER_SECRET
    )
    auth.set_access_token(setting.key, setting.secret)
    return tweepy.API(auth)


def status_text(record):
    status = record.get_status_display()

    if record.status_type != StatusTypes.Watching or status == '':
        status_type_name = record.status_type.text
        if status != '':
            status += ' (' + status_type_name + ')'
        else:
            status = status_type_name

    return status


def post_history_to_twitter(user, history):
    try:
        setting = TwitterSetting.objects.get(user=user)
    except TwitterSetting.DoesNotExist:
        return False

    title = history.record.title
    status = status_text(history)
    url = 'https://animeta.net/-%d' % history.id
    comment = history.comment
    if history.contains_spoiler:
        comment = u'[\U0001F507 내용 누설 가림]'

    api = get_api(setting)
    try:
        body = u'%s %s' % (title, status)
        if comment:
            body += u': ' + comment
        limit = 140 - (len(url) + 1)
        if len(body) > limit:
            body = body[:limit-1] + u'\u2026'
        body += ' ' + url
        api.update_status(body)
        return True
    except tweepy.TweepError:
        return False
