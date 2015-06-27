# -*- coding: utf-8 -*-
import json
import yaml
from django.db import models, transaction
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import user_passes_test
from work.models import Work, TitleMapping, normalize_title, get_or_create_work

def test_is_staff(user):
    return user.is_staff

@user_passes_test(test_is_staff)
def index(request):
    only_orphans = request.GET.get('orphans') == '1'
    offset = int(request.GET.get('offset', 0))
    limit = 50
    queryset = Work.objects.order_by('-id')
    if only_orphans:
        queryset = queryset.filter(index__record_count=0)
    return render(request, 'moderation.html', {
        'recent_works': queryset[offset:offset+limit],
        'prev_offset': offset - limit if offset > 0 else None,
        'next_offset': offset + limit,
        'only_orphans': only_orphans,
    })

@user_passes_test(test_is_staff)
def create_work(request):
    title = request.POST['title'].strip()
    work = get_or_create_work(title)
    return redirect('moderation.views.work_detail', work_id=work.id)

@user_passes_test(test_is_staff)
def delete_work(request, work_id):
    work = Work.objects.get(pk=work_id)
    assert work.record_set.count() == 0
    work.delete()
    return redirect(request.GET['return_url'])

@user_passes_test(test_is_staff)
def work_detail(request, work_id):
    work = Work.objects.get(pk=work_id)
    title_mappings = list(work.title_mappings.all())
    for mapping in title_mappings:
        mapping.count = mapping.record_count
    title_mappings.sort(key=lambda m: m.count, reverse=True)
    return render(request, 'moderation.html', {'work': work, 'title_mappings': title_mappings})

@user_passes_test(test_is_staff)
def merge_work(request, work_id):
    work = Work.objects.get(pk=work_id)
    other = Work.objects.get(pk=request.POST['other_id'])
    if work.id == other.id:
        return HttpResponse(json.dumps({'ok': False, 'error': 'Cannot merge itself'}), content_type='application/json')
    force = request.POST.get('force') == '1'
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
        return HttpResponse(json.dumps({'ok': False, 'conflicts': conflicts}), content_type='application/json')
    with transaction.atomic():
        for c in conflicts:
            u = User.objects.get(pk=c['user_id'])
            u.history_set.filter(work=other).delete()
            u.record_set.filter(work=other).delete()
        other.title_mappings.update(work=work)
        other.record_set.update(work=work)
        other.history_set.update(work=work)
        other.delete()
    return HttpResponse(json.dumps({'ok': True, 'conflicts': conflicts}), content_type='application/json')

@user_passes_test(test_is_staff)
def set_primary_title(request, mapping_id):
    mapping = TitleMapping.objects.get(pk=mapping_id)
    mapping.work.title = mapping.title
    mapping.work.save()
    return redirect('moderation.views.work_detail', work_id=mapping.work.id)

@user_passes_test(test_is_staff)
def add_mapping(request, work_id):
    work = Work.objects.get(pk=work_id)
    title = request.POST['title'].strip()
    key = normalize_title(title)
    if TitleMapping.objects.filter(key=key).exclude(work=work).count() > 0:
        raise Exception
    mapping = TitleMapping.objects.create(
        work=work,
        title=title,
        key=normalize_title(title),
    )
    return redirect('moderation.views.work_detail', work_id=work.id)

@user_passes_test(test_is_staff)
def delete_mapping(request, mapping_id):
    mapping = TitleMapping.objects.get(pk=mapping_id)
    if mapping.record_count == 0:
        mapping.delete()
    return redirect('moderation.views.work_detail', work_id=mapping.work.id)

@user_passes_test(test_is_staff)
def edit_metadata(request, work_id):
    work = Work.objects.get(pk=work_id)
    # Verify yaml
    yaml.load(request.POST['metadata'])
    work.raw_metadata = request.POST['metadata']
    work.save()
    return redirect('moderation.views.work_detail', work_id=work.id)
