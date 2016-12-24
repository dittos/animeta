import json

import yaml
from django.conf import settings
from django.contrib.auth.models import User
from django.db import models, transaction

from animeta.utils.poster import download_ann_poster, generate_thumbnail, download_poster
from api.serializers import serialize_work
from api.v2 import BaseView
from search.models import WorkIndex, WorkAttributeIndex
from work.models import Work, TitleMapping, normalize_title, get_or_create_work


class BaseAdminView(BaseView):
    def before_dispatch(self, request, *args, **kwargs):
        self.check_login()
        if not request.user.is_staff:
            self.raise_error('Staff permission required.', status=401)


class WorksView(BaseAdminView):
    def get(self, request):
        only_orphans = request.GET.get('orphans') == '1'
        offset = int(request.GET.get('offset', 0))
        limit = 50
        queryset = Work.objects.order_by('-id').exclude(blacklisted=True)
        if only_orphans:
            queryset = queryset.filter(index__record_count=0)
        return map(serialize_work, queryset[offset:offset+limit])

    def post(self, request):
        payload = json.loads(request.body)
        work = get_or_create_work(payload['title'])
        return serialize_work(work)


def serialize_title_mapping(mapping):
    return {
        'id': mapping.id,
        'title': mapping.title,
        'record_count': mapping.count,
    }


class WorkView(BaseAdminView):
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
            'image_path': work.image_filename and settings.MEDIA_URL + work.image_filename,
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
        if 'rawMetadata' in payload:
            self._edit_metadata(id, payload['rawMetadata'])
        if 'crawlImage' in payload:
            self._crawl_image(id, payload['crawlImage']['source'], payload['crawlImage'])
        if 'blacklisted' in payload:
            work = Work.objects.get(pk=id)
            work.blacklisted = payload['blacklisted']
            work.save()
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

    def _edit_metadata(self, id, raw_metadata):
        work = Work.objects.get(pk=id)
        # Verify yaml
        try:
            metadata = yaml.load(raw_metadata)
        except yaml.YAMLError as e:
            self.raise_error('YAML parse failed: ' + str(e), status=400)
        work.raw_metadata = raw_metadata
        work.metadata = metadata
        work.save()

    def _crawl_image(self, id, source, options):
        work = Work.objects.get(pk=id)
        if source == 'ann':
            ann_id = options['annId']
            work.original_image_filename = download_ann_poster(ann_id)
            if work.original_image_filename:
                work.image_filename = generate_thumbnail(work.original_image_filename, remove_ann_watermark=True)
                work.save()
        elif source == 'url':
            url = options['url']
            work.original_image_filename = download_poster(url)
            if work.original_image_filename:
                work.image_filename = generate_thumbnail(work.original_image_filename)
                work.save()
        work.save()

    def delete(self, request, id):
        work = Work.objects.get(pk=id)
        assert work.record_set.count() == 0
        work.delete()
        return {'ok': True}


class WorkTitleMappingsView(BaseAdminView):
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


class TitleMappingView(BaseAdminView):
    def delete(self, request, id):
        mapping = TitleMapping.objects.get(pk=id)
        if mapping.record_count == 0:
            mapping.delete()
        return {'ok': True}


class StudiosView(BaseAdminView):
    def get(self, request):
        return [attr.value for attr in WorkAttributeIndex.objects.filter(key='studio').all()]
