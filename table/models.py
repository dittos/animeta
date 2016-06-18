# -*- coding: utf-8 -*-
import calendar
import datetime
import urllib
import pytz

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

    def prev(self):
        if self.quarter == 1:
            return Period(self.year - 1, 4)
        else:
            return Period(self.year, self.quarter - 1)

    @classmethod
    def parse(cls, s):
        # yyyyQq
        y, q = s.split('Q', 1)
        q = int(q)
        assert len(y) == 4
        assert 1 <= q <= 4
        return cls(int(y), q)


def item_json(item, period):
    data = {}

    title = item['title']
    if not isinstance(title, basestring):
        title = title['ko']
    data['title'] = title

    data['links'] = {}
    if 'website' in item:
        data['links']['website'] = item['website']
    if 'namu_ref' in item:
        data['links']['namu'] = namu_link(item['namu_ref'])
    if 'ann_id' in item:
        prefix = 'http://www.animenewsnetwork.com/encyclopedia/anime.php?id='
        data['links']['ann'] = prefix + str(item['ann_id'])

    studio = item.get('studio')
    if isinstance(studio, basestring):
        studio = [studio]
    data['studios'] = studio

    data['source'] = item['source']
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
        localized_date = TZ.localize(parse_date(date, period))
        date = calendar.timegm(localized_date.utctimetuple()) * 1000
    if isinstance(broadcasts, basestring):
        broadcasts = [broadcasts]
    return {'date': date, 'broadcasts': broadcasts}


def parse_date(s, period):
    # date is MM-DD HH:MM format
    date, time = s.split(' ')
    date_parts = map(int, date.split('-'))
    if len(date_parts) == 3:
        y, m, d = date_parts
    else:
        y = period.year
        m, d = date_parts
    h, min = map(int, time.split(':'))
    return datetime.datetime(y, m, d, h, min)


def namu_link(ref):
    t = ref.rsplit('#', 1)
    if len(t) == 2:
        page, anchor = t
    else:
        page = ref
        anchor = None
    url = 'https://namu.wiki/w/' + urllib.quote(page.encode('utf-8'))
    if anchor:
        url += '#' + urllib.quote(anchor.encode('utf-8'))
    return url
