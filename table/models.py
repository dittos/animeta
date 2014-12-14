# -*- coding: utf-8 -*-
import calendar
import datetime
import json
import os.path
import urllib
import pytz
import yaml
from django.conf import settings
from record.models import Record
from work.models import Work, TitleMapping

TZ = pytz.timezone('Asia/Seoul')

class Period(object):
    def __init__(self, year, quarter):
        self.year = year
        self.quarter = quarter

    @property
    def month(self):
        return (1, 4, 7, 10)[self.quarter - 1]

    def __str__(self):
        return '%dQ%d' % (self.year, self.quarter)

    @classmethod
    def parse(cls, s):
        # yyyyQq
        y, q = s.split('Q', 1)
        q = int(q)
        assert len(y) == 4
        assert 1 <= q <= 4
        return cls(int(y), q)

def item_json(item, period):
    data = {'id': item['id']}

    title = item['title']
    if not isinstance(title, basestring):
        title = title['ko']
    data['title'] = title

    data['links'] = {}
    if 'website' in item:
        data['links']['website'] = item['website']
    if 'enha_ref' in item:
        data['links']['enha'] = enha_link(item['enha_ref'])
    if 'ann_id' in item:
        data['links']['ann'] = 'http://www.animenewsnetwork.com/encyclopedia/anime.php?id=' + str(item['ann_id'])

    studio = item.get('studio')
    if isinstance(studio, basestring):
        studio = [studio]
    data['studios'] = studio

    data['source'] = item['source']
    data['image_url'] = 'http://anitable.com/media/%s/images/thumb/%s' % (period, item['image'])
    data['schedule'] = get_schedule(item, period)
    return data

def get_schedule(item, period):
    result = {'jp': _get_schedule(item.get('schedule'), period)}
    kr = _get_schedule(item.get('schedule_kr'), period)
    if kr:
        result['kr'] = kr
    return result

def _get_schedule(schedule, period):
    if not schedule:
        return None
    if len(schedule) == 1:
        date = None
        broadcasts = schedule[0]
    else:
        date, broadcasts = schedule
        date = calendar.timegm(TZ.localize(parse_date(date, period)).utctimetuple()) * 1000
    if isinstance(broadcasts, basestring):
        broadcasts = [broadcasts]
    return {'date': date, 'broadcasts': broadcasts}

def parse_date(s, period):
    # date is MM-DD HH:MM format
    date, time = s.split(' ')
    m, d = map(int, date.split('-'))
    h, min = map(int, time.split(':'))
    return datetime.datetime(period.year, m, d, h, min)

def enha_link(ref):
    t = ref.rsplit('#', 1)
    if len(t) == 2:
        page, anchor = t
    else:
        page = ref
        anchor = None
    url = 'http://mirror.enha.kr/wiki/' + urllib.quote(page.encode('utf-8'))
    if anchor:
        url += '#' + urllib.quote(anchor.encode('utf-8'))
    return url

def load_data(period):
    path = os.path.join(settings.ANITABLE_DATA_DIR, '%s/schedule.yml' % period)
    with open(path) as fp:
        data = []
        for item in yaml.load_all(fp):
            data.append(item_json(item, period))
        return data

def next_schedule(date):
    day = datetime.timedelta(days=1)
    thres = datetime.timedelta(hours=12)
    while date + thres < datetime.datetime.now():
        date = date + 7 * day
    return date

def annotate_statuses(items, user):
    data = {'items': items, 'contains_kr_schedule': False}
    for item in items:
        work = TitleMapping.objects.get(title=item['title']).work
        item['work_id'] = work.id
        item['record'] = None
        if user.is_authenticated():
            try:
                record = user.record_set.get(work=work)
                item['record'] = {
                    'id': record.id,
                    'status': record.status,
                    'status_type': record.status_type.name,
                }
            except Record.DoesNotExist:
                pass
        if item['record']:
            item['record_count'] = work.record_set.count()
        else:
            item['record_count'] = work.index.record_count
        if 'kr' in item.get('schedule', {}):
            data['contains_kr_schedule'] = bool(item['schedule']['kr']['date'])
    return data
