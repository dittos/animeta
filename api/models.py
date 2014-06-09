import os
import hashlib

from django.db import models
from django.core.cache import cache
from django.conf import settings
from django.contrib.auth.models import User

DAY = 60 * 60 * 24
DEFAULT_TTL = 14 * DAY

def generate_session_token(user):
    # Generate token
    token = ':'.join([settings.SECRET_KEY, str(user.username), os.urandom(10)])
    token = hashlib.sha256(token).hexdigest()

    # Store token
    cache.set('apisession:%s' % token, user.username, DEFAULT_TTL)
    return token

def get_user_from_token(token):
    key = 'apisession:%s' % token
    username = cache.get(key)
    if not username: return None
    cache.set(key, username, DEFAULT_TTL)
    return User.objects.get(username=username)
