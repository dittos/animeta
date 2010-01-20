import os, sys, os.path
root = os.path.abspath(os.path.dirname(__file__) + '/../..')
sys.path.insert(0, root + '/animeta')
sys.path.insert(0, root)
os.environ['DJANGO_SETTINGS_MODULE'] = 'animeta.settings'
import django.core.handlers.wsgi

orig_handler = django.core.handlers.wsgi.WSGIHandler()
def application(environ, start_response):
	environ['PATH_INFO'] = environ['REQUEST_URI']
	return orig_handler(environ, start_response)
