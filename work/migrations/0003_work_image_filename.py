# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-06-18 18:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('work', '0002_work_raw_metadata'),
    ]

    operations = [
        migrations.AddField(
            model_name='work',
            name='image_filename',
            field=models.CharField(max_length=100, null=True),
        ),
    ]