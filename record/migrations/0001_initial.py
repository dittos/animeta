# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import record.models
import record.fields


class Migration(migrations.Migration):

    dependencies = [
        ('work', '__first__'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=30)),
                ('position', models.PositiveIntegerField()),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('position', 'id'),
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='History',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('status', models.CharField(max_length=30, verbose_name='\uac10\uc0c1 \uc0c1\ud0dc', blank=True)),
                ('status_type', record.fields.StatusTypeField(default=record.models.StatusType(1, '\ubcf4\ub294 \uc911'), choices=[(record.models.StatusType(0, '\uc644\ub8cc'), '\uc644\ub8cc'), (record.models.StatusType(1, '\ubcf4\ub294 \uc911'), '\ubcf4\ub294 \uc911'), (record.models.StatusType(2, '\uc911\ub2e8'), '\uc911\ub2e8'), (record.models.StatusType(3, '\ubcfc \uc608\uc815'), '\ubcfc \uc608\uc815')])),
                ('comment', models.TextField(verbose_name='\uac10\uc0c1\ud3c9', blank=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('user', models.ForeignKey(editable=False, to=settings.AUTH_USER_MODEL)),
                ('work', models.ForeignKey(editable=False, to='work.Work')),
            ],
            options={
                'ordering': ['-id'],
                'get_latest_by': 'updated_at',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Record',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=100)),
                ('status', models.CharField(max_length=30, blank=True)),
                ('status_type', record.fields.StatusTypeField(default=record.models.StatusType(1, '\ubcf4\ub294 \uc911'), choices=[(record.models.StatusType(0, '\uc644\ub8cc'), '\uc644\ub8cc'), (record.models.StatusType(1, '\ubcf4\ub294 \uc911'), '\ubcf4\ub294 \uc911'), (record.models.StatusType(2, '\uc911\ub2e8'), '\uc911\ub2e8'), (record.models.StatusType(3, '\ubcfc \uc608\uc815'), '\ubcfc \uc608\uc815')])),
                ('updated_at', models.DateTimeField(null=True)),
                ('category', models.ForeignKey(to='record.Category', null=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
                ('work', models.ForeignKey(to='work.Work')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='record',
            unique_together=set([('user', 'work')]),
        ),
    ]
