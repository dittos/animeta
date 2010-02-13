# -*- coding: utf-8 -*-

from django import template

register = template.Library()

@register.inclusion_tag("history.html")
def show_history(history, options="user,work"):
	options = options.split(',')
	return {
		'history': history,
		'show_user': 'user' in options,
		'show_work': 'work' in options,
	}
