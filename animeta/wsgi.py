# encoding: utf-8
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "animeta.settings")

from django.core.wsgi import get_wsgi_application

orig_app = get_wsgi_application()
def application(environ, start_response):
    environ['PATH_INFO'] = urllib.unquote(environ['REQUEST_URI'].split('?')[0])
    return orig_app(environ, start_response)
