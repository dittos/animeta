import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'animeta.settings'
import sys
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/../..'))
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/..'))
import django; django.setup()
from django.conf import settings
from search import indexer
from search.models import WorkPeriodIndex
from table.models import item_json, Period

period = '2015Q2'
indexer.run()
indexes = WorkPeriodIndex.objects.filter(period=period).all()
for index in indexes:
    print '---'
    print index.work.raw_metadata
