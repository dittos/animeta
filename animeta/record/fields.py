from django.db import models
from django import forms
from record.models import StatusType, StatusTypes

class StatusTypeField(models.SmallIntegerField):
	__metaclass__ = models.SubfieldBase

	def __init__(self, *args, **kwargs):
		kwargs['choices'] = [(t, t.text) for t in StatusTypes.types]
		kwargs['default'] = StatusTypes.Watching
		super(StatusTypeField, self).__init__(*args, **kwargs)
	
	def to_python(self, value):
		if isinstance(value, StatusType):
			return value
		elif isinstance(value, int):
			return StatusTypes.from_id(value)
		elif isinstance(value, str) or isinstance(value, unicode):
			return StatusTypes.from_name(value)

	def get_db_prep_value(self, value):
		return value.id
