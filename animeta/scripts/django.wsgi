import os, sys, os.path
root = os.path.abspath(os.path.dirname(__file__) + '/../..')
sys.path.insert(0, root + '/animeta')
sys.path.insert(0, root)
os.environ['DJANGO_SETTINGS_MODULE'] = 'animeta.settings'
import django.core.handlers.wsgi
import urllib

orig_handler = django.core.handlers.wsgi.WSGIHandler()
def application(environ, start_response):
	environ['PATH_INFO'] = urllib.unquote(environ['REQUEST_URI']).split('?')[0]
	return orig_handler(environ, start_response)
