# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-07-26 22:51
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('record', '0004_auto_20160726_2201'),
    ]

    operations = [
        migrations.AlterField(
            model_name='history',
            name='record_prep',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='record.Record'),
        ),
        migrations.RenameField(
            model_name='history',
            old_name='record_prep',
            new_name='record',
        )
    ]