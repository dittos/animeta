# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-12-04 17:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0003_workperiodindex_is_first_period'),
    ]

    operations = [
        migrations.AddField(
            model_name='workindex',
            name='blacklisted',
            field=models.BooleanField(default=False),
        ),
    ]