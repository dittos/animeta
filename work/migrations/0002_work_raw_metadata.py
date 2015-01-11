# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('work', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='work',
            name='raw_metadata',
            field=models.TextField(null=True),
            preserve_default=True,
        ),
    ]
