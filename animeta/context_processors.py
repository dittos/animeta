from django.conf import settings as django_settings
from animeta.assets import ASSET_FILENAMES

def hijax(request):
    return {'base': 'base_xhr.html' if request.is_ajax() else 'base.html'}

def settings(request):
    return {'settings': django_settings}

def assets(request):
    return {'asset_filenames': ASSET_FILENAMES}
