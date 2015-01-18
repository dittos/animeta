# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('work', '0002_work_raw_metadata'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkIndex',
            fields=[
                ('work', models.OneToOneField(related_name='index', primary_key=True, serialize=False, to='work.Work')),
                ('title', models.CharField(max_length=100)),
                ('record_count', models.IntegerField()),
                ('rank', models.IntegerField(db_index=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='WorkTitleIndex',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('key', models.CharField(max_length=255, db_index=True)),
                ('work', models.ForeignKey(to='search.WorkIndex')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
