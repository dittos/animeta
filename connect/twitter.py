import tweepy
from django.conf import settings
from record.templatetags.status import status_text
from connect.models import TwitterSetting


def get_api(setting):
    auth = tweepy.OAuthHandler(
        settings.TWITTER_CONSUMER_KEY,
        settings.TWITTER_CONSUMER_SECRET
    )
    auth.set_access_token(setting.key, setting.secret)
    return tweepy.API(auth)


def post_history_to_twitter(user, history):
    try:
        setting = TwitterSetting.objects.get(user=user)
    except TwitterSetting.DoesNotExist:
        return False

    title = history.record.title
    status = status_text(history)
    url = 'http://animeta.net/-%d' % history.id
    comment = history.comment

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
