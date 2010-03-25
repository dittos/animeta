from django.db import models
from django.contrib.auth.models import User

class Me2Setting(models.Model):
	user = models.ForeignKey(User)
	userid = models.CharField(max_length=100)
	userkey = models.CharField(max_length=30)

def get_connected_services(user):
	import me2day

	services = []
	for service in (me2day, ):
		setting = service.get_setting(user)
		if setting:
			services.append(setting)
	return services
