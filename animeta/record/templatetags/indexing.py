# -*- encoding: utf-8 -*-
from django import template
import re
import itertools

register = template.Library()

def first_char(string):
	if not string:
		return '#'

	ch = ord(string[0])
	if ch >= 0xAC00 and ch <= 0xD7A3:
		lead = (ch - 0xAC00) // 588
		if lead in (1, 4, 8, 10, 13):
			lead -= 1
		return unichr(0xAC00 + lead * 588)
	elif re.match('^[A-Za-z]', string):
		return string[0].upper()
	else:
		return '#'

def group_records(records):
	return [(k, list(v)) for (k, v) in itertools.groupby(records, key=lambda r: first_char(r.work.title))]

def make_index(records, continued='cont.'):
	per_column = (len(records) / 3) or 1

	cols = [], [], []
	for i, record in enumerate(records):
		cols[min(i / per_column, 2)].append(record)

	cols = map(group_records, cols)
	
	for n, col in enumerate(cols):
		try:
			group = cols[n + 1][0]
			if group[0] == col[len(col) - 1][0]:
				cols[n + 1][0] = (group[0] + u' (%s)' % continued, group[1])
		except:
			pass

	return cols

@register.tag
def index(parser, token):
	tag_name, records_var, as_, columns_var = token.split_contents()
	return MakeIndexNode(records_var, columns_var)

class MakeIndexNode(template.Node):
	def __init__(self, records_var, columns_var):
		self.records_var = records_var
		self.columns_var = columns_var

	def render(self, context):
		context[self.columns_var] = make_index(context[self.records_var], u'계속')
		return ''
