# -*- coding: utf-8 -*-
from django.db import models, transaction, IntegrityError
from django.contrib.auth.models import User
from work.models import Work, normalize_title, TitleMapping

class MergeRequest(models.Model):
    user = models.ForeignKey(User)
    target = models.ForeignKey(Work)
    source = models.ForeignKey(Work, related_name='merge_with')

    @property
    def avail(self):
        return normalize_title(self.target.title) != normalize_title(self.source.title) and self.target.popularity > 0 and self.source.popularity > 0

    class Meta:
        db_table = 'work_mergerequest'
        unique_together = ('target', 'source')
    
def has_merge_request(self, w):
    return bool(MergeRequest.objects.filter(source=self, target=w)) or bool(MergeRequest.objects.filter(target=self, source=w))

def merge(self, other):
    TitleMapping.objects.filter(work=other).update(work=self)
    forced = []
    try:
        with transaction.commit_on_success():
            other.record_set.update(work=self)
            other.history_set.update(work=self)
    except IntegrityError, e:
        # self와 other의 기록을 함께 가진 경우
        # 나중에 기록된 것에 모두 합쳐버린다.
        w = [self, other]
        for u in User.objects.filter(record__work__in=w) \
            .annotate(count=models.Count('record__work')) \
            .filter(count__gt=1):
            forced.append(u)
            with transaction.commit_on_success():
                r = u.record_set.filter(work__in=w).latest('updated_at')
                delete = other if r.work == self else self
                u.record_set.filter(work=delete).delete()
                u.history_set.filter(work=delete).update(work=r.work)

        # 병합 처리가 완료되면 다시 합쳐본다.
        with transaction.commit_on_success():
            other.record_set.update(work=self)
            other.history_set.update(work=self)
    return forced
