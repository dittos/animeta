import json

from django.contrib.auth.models import User
from django.db import models, transaction

from api.serializers import serialize_work
from api.v2 import BaseView
from search.models import WorkIndex
from work.models import Work, TitleMapping, normalize_title


# TODO: auth


class WorksView(BaseView):
    def get(self, request):
        only_orphans = request.GET.get('orphans') == '1'
        offset = int(request.GET.get('offset', 0))
        limit = 50
        queryset = Work.objects.order_by('-id')
        if only_orphans:
            queryset = queryset.filter(index__record_count=0)
        return map(serialize_work, queryset[offset:offset+limit])


def serialize_title_mapping(mapping):
    return {
        'id': mapping.id,
        'title': mapping.title,
        'record_count': mapping.count,
    }


class WorkView(BaseView):
    def get(self, request, id):
        work = Work.objects.get(pk=id)
        title_mappings = list(work.title_mappings.all())
        for mapping in title_mappings:
            mapping.count = mapping.record_count
        title_mappings.sort(key=lambda m: m.count, reverse=True)
        try:
            index = work.index
        except WorkIndex.DoesNotExist:
            index = None
        return {
            'id': work.id,
            'title': work.title,
            'image_filename': work.image_filename,
            'raw_metadata': work.raw_metadata,
            'metadata': work.metadata,
            'title_mappings': map(serialize_title_mapping, title_mappings),
            'index': {
                'record_count': work.index.record_count,
                'rank': work.index.rank,
            } if index else None,
        }

    def post(self, request, id):
        payload = json.loads(request.body)
        if 'primaryTitleMappingId' in payload:
            self._set_primary_title_mapping(payload['primaryTitleMappingId'])
        if 'mergeWorkId' in payload:
            self._merge(id, payload['mergeWorkId'], payload.get('forceMerge', False))
        return self.get(request, id)

    def _set_primary_title_mapping(self, primary_title_mapping_id):
        mapping = TitleMapping.objects.get(pk=primary_title_mapping_id)
        mapping.work.title = mapping.title
        mapping.work.save()

    def _merge(self, work_id, other_work_id, force):
        work = Work.objects.get(pk=work_id)
        other = Work.objects.get(pk=other_work_id)
        if work.id == other.id:
            self.raise_error('Cannot merge itself', status=400)
        conflicts = []
        for u in (User.objects.filter(record__work__in=[work, other])
                          .annotate(count=models.Count('record__work'))
                          .filter(count__gt=1)):
            conflicts.append({
                'user_id': u.id,
                'username': u.username,
                'ids': [r.id for r in u.record_set.filter(work__in=[work, other])]
            })
        if conflicts and not force:
            self.raise_error('Users with conflict exist', status=422, extra={
                'conflicts': conflicts,
            })
        with transaction.atomic():
            for c in conflicts:
                u = User.objects.get(pk=c['user_id'])
                u.history_set.filter(work=other).delete()
                u.record_set.filter(work=other).delete()
            other.title_mappings.update(work=work)
            other.record_set.update(work=work)
            other.history_set.update(work=work)
            other.delete()

    def delete(self, request, id):
        work = Work.objects.get(pk=id)
        assert work.record_set.count() == 0
        work.delete()
        return {'ok': True}


class WorkTitleMappingsView(BaseView):
    def post(self, request, id):
        payload = json.loads(request.body)
        work = Work.objects.get(pk=id)
        title = payload['title'].strip()
        key = normalize_title(title)
        if TitleMapping.objects.filter(key=key).exclude(work=work).count() > 0:
            raise Exception
        created = TitleMapping.objects.create(
            work=work,
            title=title,
            key=normalize_title(title),
        )
        created.count = 0
        return serialize_title_mapping(created)


class TitleMappingView(BaseView):
    def delete(self, request, id):
        mapping = TitleMapping.objects.get(pk=id)
        if mapping.record_count == 0:
            mapping.delete()
        return {'ok': True}
