# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-07-26 22:01
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('record', '0002_history_contains_spoiler'),
    ]

    operations = [
        migrations.AddField(
            model_name='history',
            name='record_prep',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='record.Record'),
        ),
    ]
