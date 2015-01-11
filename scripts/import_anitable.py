import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'animeta.settings'
import sys
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/../..'))
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/..'))
import django; django.setup()
from django.conf import settings
import yaml
from work.models import Work, TitleMapping
from table.models import item_json, Period

periods = ('2014Q2', '2014Q3', '2014Q4', '2015Q1')
for period in periods:
    path = os.path.join(settings.ANITABLE_DATA_DIR, '%s/schedule.yml' % period)
    with open(path) as fp:
        for raw_data in fp.read().split('---\n'):
            if not raw_data.strip():
                continue
            data = item_json(yaml.load(raw_data), Period.parse(period))
            raw_data = 'periods: ["%s"]\n%s' % (period, raw_data)
            work = TitleMapping.objects.get(title=data['title']).work
            work.raw_metadata = raw_data
            work.save()
