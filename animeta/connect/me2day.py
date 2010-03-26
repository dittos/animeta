name = 'me2day'

import urllib
import urllib2
from django.utils import simplejson as json
from hashlib import md5
from random import randrange
from django.conf import settings

def generate_auth_key(user_key):
	nonce = '%x' % randrange(0x10000000, 0xFFFFFFFF)
	return nonce + md5(nonce + user_key).hexdigest()

def call(method, uid=None, user_key=None, params={}):
	params['akey'] = settings.ME2DAY_APP_KEY
	if uid:
		params['uid'] = uid
	if user_key:
		params['ukey'] = generate_auth_key(user_key)
	if method == 'create_post':
		method = '%s/%s' % (method, uid)
	return json.load(urllib2.urlopen('http://me2day.net/api/%s.json' % method, urllib.urlencode(params)))

def get_setting(user):
	from connect.models import Me2Setting
	try:
		return Me2Setting.objects.get(user=user)
	except Me2Setting.DoesNotExist:
		return None

def post_history(setting, title, status, url, comment):
	try:
		body = u'"%s %s":%s' % (title, status, url)
		if comment:
			body += u' : ' + comment
		tags = 'me2animeta %s %s' % (title, status)
		call('create_post', setting.userid, setting.userkey, {
			'post[body]': body.encode('utf-8'),
			'post[tags]': tags.encode('utf-8')
		})
		return True
	except:
		return False
