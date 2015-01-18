# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('work', '0002_work_raw_metadata'),
        ('search', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkPeriodIndex',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('period', models.CharField(max_length=6, db_index=True)),
                ('work', models.ForeignKey(to='work.Work')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
