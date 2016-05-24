from django.db import models
from record.models import StatusType, StatusTypes


class StatusTypeField(models.SmallIntegerField):
    def __init__(self, *args, **kwargs):
        kwargs['choices'] = [(t, t.text) for t in StatusTypes.types]
        kwargs['default'] = StatusTypes.Watching
        super(StatusTypeField, self).__init__(*args, **kwargs)

    def from_db_value(self, value, expression, connection, context):
        if value is None:
            return value
        return StatusTypes.from_id(value)

    def to_python(self, value):
        if isinstance(value, StatusType):
            return value
        elif isinstance(value, int):
            return StatusTypes.from_id(value)
        elif isinstance(value, str) or isinstance(value, unicode):
            return StatusTypes.from_name(value)

    def get_prep_value(self, value):
        if isinstance(value, int):
            return value
        return value.id

    def get_default(self):
        return StatusTypes.Watching.id
