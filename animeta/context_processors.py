from django.conf import settings as django_settings
from animeta.assets import ASSET_FILENAMES

def settings(request):
    return {'settings': django_settings}

def assets(request):
    return {'asset_filenames': ASSET_FILENAMES}
