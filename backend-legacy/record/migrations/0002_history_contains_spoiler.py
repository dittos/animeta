# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('record', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='history',
            name='contains_spoiler',
            field=models.BooleanField(default=False),
        ),
    ]
