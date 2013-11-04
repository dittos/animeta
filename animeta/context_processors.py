from django.conf import settings as django_settings

def hijax(request):
    return {'base': 'base_xhr.html' if request.is_ajax() else 'base.html'}

def settings(request):
    return {'settings': django_settings}
