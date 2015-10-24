# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0002_workperiodindex'),
    ]

    operations = [
        migrations.AddField(
            model_name='workperiodindex',
            name='is_first_period',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
    ]
