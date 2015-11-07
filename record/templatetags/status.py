# -*- coding: utf-8 -*-
from django import template
from record.models import StatusTypes

register = template.Library()


def status_text(record):
    status = record.get_status_display()

    if record.status_type != StatusTypes.Watching or status == '':
        status_type_name = record.status_type.text
        if status != '':
            status += ' (' + status_type_name + ')'
        else:
            status = status_type_name

    return status

register.filter('status_text', status_text)
