# -*- coding: utf-8 -*-

import string
from django import template
from django.template.defaultfilters import stringfilter
from django.core.urlresolvers import reverse
from record.models import StatusTypes

register = template.Library()

def status_text(record):
	status = record.status.strip()
	if status and status[-1] in string.digits:
		status += u'화'

	if record.status_type != StatusTypes.Watching or status == '':
		status_type_name = record.status_type.text
		if status != '':
			status += ' (' + status_type_name + ')'
		else:
			status = status_type_name

	return status

register.filter('status_text', status_text)

@register.tag(name='status_text')
def status_text_tag(parser, token):
	tag_name, of, record_var = token.split_contents()
	return StatusTextNode(record_var)

class StatusTextNode(template.Node):
	def __init__(self, record_var):
		self.record_var = record_var

	def render(self, context):
		from work.models import Work
		from record.models import Record
		record = context[self.record_var]
		if type(record) is Work:
			try:
				record = context.get('user').record_set.get(work=record)
			except:
				record = None

		if not record:
			work = context.get('work')
			return '<span class="status no-record"><a href="%s">기록 없음</a></span>' % reverse('record.views.add', args=[] if not work else [work.title])

		cls = 'status'
		if record.status_type == StatusTypes.Watching:
			cls += ' watching'
		status = status_text(record)

		try:
			if record.user == context['user'] and type(record) is Record:
				status = '<a href="%s">%s</a>' % (reverse('record.views.update', args=[getattr(record, 'record', record).id]), status)
		except:
			pass # for a history with deleted record
		return '<span class="%s">%s</span>' % (cls, status)
