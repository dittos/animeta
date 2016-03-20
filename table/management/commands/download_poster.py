import os.path
import urllib
from xml.etree import ElementTree

import requests
from django.core.management.base import BaseCommand

from search import indexer
from search.models import WorkPeriodIndex


class Command(BaseCommand):
    help = 'Download poster images from ANN'

    def add_arguments(self, parser):
        parser.add_argument('period')
        parser.add_argument('--data-dir', dest='data_dir')
        parser.add_argument('--skip-indexer', action='store_true', dest='skip_indexer', default=False)

    def handle(self, *args, **options):
        period = options['period']
        if not options['skip_indexer']:
            indexer.run()  # Ensure indexes

        basepath = os.path.join(options['data_dir'], period, 'images')
        try:
            os.makedirs(basepath)
        except:
            pass

        for index in WorkPeriodIndex.objects.filter(period=period):
            work = index.work
            metadata = work.metadata
            fn = metadata.get('image')
            if fn and os.path.exists(os.path.join(basepath, fn)):
                print 'has image', fn
                continue
            ann_id = metadata.get('ann_id')
            if not ann_id:
                print 'no ann_id', work.id
                continue
            fn = 'ann' + str(ann_id) + '.jpg'
            imgpath = os.path.join(basepath, fn)
            if not os.path.exists(imgpath):
                info = requests.get('http://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=' + str(ann_id))
                tree = ElementTree.fromstring(info.content)
                fullsrc = None
                for img in tree.findall('.//info[@type="Picture"]/img'):
                    src = img.attrib['src']
                    if 'full' in src:
                        fullsrc = src
                    elif 'max' in src and not fullsrc:
                        fullsrc = src
                if fullsrc:
                    urllib.urlretrieve(fullsrc, imgpath)
            if os.path.exists(imgpath):
                work.raw_metadata = work.raw_metadata.rstrip() + '\nimage: ' + fn
                work.save()
            else:
                print 'failed', work.id
