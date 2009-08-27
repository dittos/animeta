import os, sys
sys.path.insert(0, '/home/ditto/animeta')
sys.path.insert(0, '/home/ditto')
os.environ['DJANGO_SETTINGS_MODULE'] = 'animeta.settings'
import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
