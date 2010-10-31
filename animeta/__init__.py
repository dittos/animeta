import urllib
from django.utils.encoding import smart_str
import django.core.urlresolvers

_orig_reverse = django.core.urlresolvers.reverse

def reverse(viewname, urlconf=None, args=None, kwargs=None, prefix=None, current_app=None):
	if args:
		args = [urllib.quote(smart_str(v)) for v in args]

	if kwargs:
		kwargs = dict((k, urllib.quote(smart_str(v))) for k, v in kwargs.iteritems())

	return _orig_reverse(viewname, urlconf, args, kwargs, prefix, current_app)

django.core.urlresolvers.reverse = reverse
