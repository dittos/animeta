# -*- coding: utf-8 -*-

from django import template
from django.template.defaultfilters import stringfilter
from django.core.urlresolvers import reverse

register = template.Library()

def status_text(status):
	status = status.strip()
	if not status:
		return u'완료'
	elif status[-1:] in '0123456789':
		return status + u'화'
	else:
		return status

register.filter('status_text', stringfilter(status_text))

@register.tag(name='status_text')
def status_text_tag(parser, token):
	tag_name, of, record_var = token.split_contents()
	return StatusTextNode(record_var)

class StatusTextNode(template.Node):
	def __init__(self, record_var):
		self.record_var = record_var

	def render(self, context):
		record = context[self.record_var]
		if not record:
			work = context.get('work')
			return '<span class="status no-record"><a href="%s">기록 없음</a></span>' % reverse('record.views.add', args=[] if not work else [work.title])

		cls = 'status'
		if not record.status.strip():
			cls += ' finished'
		status = status_text(record.status)

		try:
			if record.user == context['user']:
				status = '<a href="%s">%s</a>' % (reverse('record.views.update', args=[getattr(record, 'record', record).id]), status)
		except:
			pass # for a history with deleted record
		return '<span class="%s">%s</span>' % (cls, status)
