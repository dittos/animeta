name = 'Twitter'

try:
	import tweepy
	available = True
except:
	available = False

from models import TwitterSetting

def get_setting(user):
	try:
		return TwitterSetting.objects.get(user=user)
	except TwitterSetting.DoesNotExist:
		return None

def get_api(setting):
	from django.conf import settings
	auth = tweepy.OAuthHandler(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)
	auth.set_access_token(setting.key, setting.secret)
	return tweepy.API(auth)

def post_history(setting, title, status, url, comment):
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
	except:
		return False
