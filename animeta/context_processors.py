def hijax(request):
    return {'base': 'base_xhr.html' if request.is_ajax() else 'base.html'}
