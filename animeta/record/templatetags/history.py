# -*- coding: utf-8 -*-

from django import template

register = template.Library()

@register.inclusion_tag("history.html", takes_context=True)
def show_history(context, history, options="user,work"):
	options = options.split(',')
	try:
		can_delete = 'delete' in options and history.user == context['user'] and history.record.history_set.count() > 1 # XXX: N+1 query problem
	except:
		can_delete = False
	return {
		'user': context['user'],
		'history': history,
		'show_user': 'user' in options,
		'show_work': 'work' in options,
		'can_delete': can_delete
	}
