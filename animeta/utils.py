import requests
from django.conf import settings
from django.http import Http404


def _call_api_internal(request, path, params=None):
    return requests.get(
        settings.API_ENDPOINT + path,
        params=params,
        cookies=request.COOKIES,
        headers={'Host': request.get_host()}
    )


def call_api_internal(request, path, params=None):
    resp = _call_api_internal(request, path, params)
    if resp.status_code == 404:
        raise Http404()
    resp.raise_for_status()
    return resp.json()


def get_current_user(request):
    resp = _call_api_internal(request, '/me')
    if resp.status_code != 200:
        return None
    return resp.json()


def call_render_backend(path, preload_data):
    try:
        resp = requests.post(settings.RENDER_BACKEND_URL + path,
                             json=preload_data,
                             timeout=settings.RENDER_BACKEND_TIMEOUT)
        html = resp.content
    except Exception as e:
        html = '<!-- Render server not responding: %s -->' % e
    return html
