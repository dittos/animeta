def get_connected_services(user):
	import me2day, twitter

	services = []
	for service in (me2day, twitter):
		setting = service.get_setting(user)
		if setting:
			services.append((service, setting))
	return services

def post_history(history):
	from record.templatetags.status import status_text
	kwargs = {
		'title': history.work.title,
		'status': status_text(history.status),
		'url': 'http://animeta.net/-%d' % history.id,
		'comment': history.comment,
	}

	for service, setting in get_connected_services(history.user):
		service.post_history(setting, **kwargs)
