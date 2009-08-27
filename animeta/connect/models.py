from django.db import models
from django.contrib.auth.models import User

class Me2Setting(models.Model):
	user = models.ForeignKey(User)
	userid = models.CharField(max_length=100)
	userkey = models.CharField(max_length=30)
