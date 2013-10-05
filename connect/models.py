from django.db import models
from django.contrib.auth.models import User

class Me2Setting(models.Model):
    user = models.ForeignKey(User)
    userid = models.CharField(max_length=100)
    userkey = models.CharField(max_length=30)

class TwitterSetting(models.Model):
    user = models.ForeignKey(User)
    key = models.CharField(max_length=255)
    secret = models.CharField(max_length=255)

class FacebookSetting(models.Model):
    user = models.ForeignKey(User)
    key = models.CharField(max_length=255)
