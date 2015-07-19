# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from work.models import Work

#class MergeRequest(models.Model):
#    user = models.ForeignKey(User)
#    target = models.ForeignKey(Work)
#    source = models.ForeignKey(Work, related_name='merge_with')
#
#    class Meta:
#        db_table = 'work_mergerequest'
#        unique_together = ('target', 'source')
