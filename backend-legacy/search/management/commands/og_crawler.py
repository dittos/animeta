from django.core.management.base import BaseCommand
from work.models import Work
import requests
import traceback
import os


class Command(BaseCommand):
    def handle(self, *args, **options):
        works = Work.objects.filter(metadata__has_key='website')
        for work in works:
            try:
                filename = 'tmp/{}.html'.format(work.id)
                if not os.path.exists(filename):
                    continue
                with open(filename) as fp:
                    c = fp.read()
                    if 'og:image' in c:
                        print work.metadata['website'],
                        for line in c.splitlines():
                            if 'og:image' in line:
                                t = line.split('content=')[1]
                                url = t.split(t[0])[1]
                                if not url.startswith('http'):
                                    url = work.metadata['website'].rstrip('/') + '/' + url.lstrip('/')

                                if '.png' in url.lower():
                                    f = 'tmp/img/{}.png'.format(work.id)
                                elif '.jpg' in url.lower():
                                    f = 'tmp/img/{}.jpg'.format(work.id)
                                print url
                                with open(f, 'wb') as fp:
                                    fp.write(requests.get(url).content)
                                break
                #resp = requests.get(work.metadata['website'])
                #with open(filename, 'w') as fp:
                #    fp.write(resp.content)
            except:
                traceback.print_exc()
