import os
import hashlib

from django.db import models
from django.core.cache import cache
from django.conf import settings
from django.contrib.auth.models import User

def generate_session_token(user):
    # Generate token
    token = ':'.join([settings.SECRET_KEY, str(user.username), os.urandom(10)])
    token = hashlib.sha256(token).hexdigest()

    # Store token
    days = 60 * 60 * 24
    cache.set('apisession:%s' % token, user.username, 14 * days)

    return token

def get_user_from_token(token):
    username = cache.get('apisession:%s' % token)
    if not username: return None
    return User.objects.get(username=username)
