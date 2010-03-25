def post_history(history):
	from record.templatetags.status import status_text
	kwargs = {
		'title': history.work.title,
		'status': status_text(history.status),
		'url': 'http://animeta.net/-%d' % history.id,
		'comment': history.comment,
	}

	import me2day
	me2day.post_history(me2day.get_setting(history.user), **kwargs)
