import me2day
import twitter
from record.templatetags.status import status_text

def get_connected_services(user):
	services = []
	for service in (me2day, twitter):
		if getattr(service, 'available', True):
			setting = service.get_setting(user)
			if setting:
				services.append((service, setting))
	return services

def post_history(history):
	kwargs = {
		'title': history.work.title,
		'status': status_text(history.status),
		'url': 'http://animeta.net/-%d' % history.id,
		'comment': history.comment,
	}

	for service, setting in get_connected_services(history.user):
		service.post_history(setting, **kwargs)
