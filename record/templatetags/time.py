import datetime
from django import template
from django.utils.timezone import utc
from babel.dates import format_timedelta

register = template.Library()

@register.filter
def timesince(t):
    now = datetime.datetime.now()
    delta = now - t
    return format_timedelta(delta, locale='ko')
