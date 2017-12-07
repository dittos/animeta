# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.postgres.fields import JSONField


class Work(models.Model):
    title = models.CharField(max_length=100, unique=True)
    raw_metadata = models.TextField(null=True)
    metadata = JSONField(null=True)
    image_filename = models.CharField(max_length=100, null=True, blank=False)
    original_image_filename = models.CharField(max_length=100, null=True, blank=False)
    blacklisted = models.BooleanField(default=False)


class TitleMapping(models.Model):
    work = models.ForeignKey(Work, related_name='title_mappings')
    title = models.CharField(max_length=100, unique=True)
    key = models.CharField(max_length=100)
