# -*- coding: utf-8 -*-
import enum
from django.db import models
from django.contrib.auth.models import User
from work.models import Work


@enum.unique
class StatusType(enum.IntEnum):
    finished = 0
    watching = 1
    suspended = 2
    interested = 3


class Category(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=30)
    position = models.PositiveIntegerField()


class Record(models.Model):
    user = models.ForeignKey(User)
    work = models.ForeignKey(Work)
    title = models.CharField(max_length=100)
    status = models.CharField(max_length=30, blank=True)
    status_type = models.SmallIntegerField()
    category = models.ForeignKey(Category, null=True)
    updated_at = models.DateTimeField(null=True, auto_now_add=True)

    class Meta:
        unique_together = ('user', 'work')


class History(models.Model):
    user = models.ForeignKey(User, editable=False)
    work = models.ForeignKey(Work, editable=False)
    record = models.ForeignKey(Record)
    status = models.CharField(max_length=30, blank=True)
    status_type = models.SmallIntegerField()
    comment = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    contains_spoiler = models.BooleanField(default=False)
