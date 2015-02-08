from django import template
from django.utils.safestring import mark_safe

register = template.Library()

@register.filter
def escapejson(value):
    return mark_safe(value.replace('<', '\\u003c'))
