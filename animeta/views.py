from django.shortcuts import render, redirect
from animeta.utils import call_render_backend, get_current_user, call_api_internal


def index(request):
    preload_data = {
        'current_user': get_current_user(request),
        'chart': call_api_internal(request, '/charts/works/weekly', {'limit': 5}),
        'posts': call_api_internal(request, '/posts', {'min_record_count': 2, 'count': 10}),
    }
    return render(request, "index.html", {
        'preload_data': preload_data,
        'html': call_render_backend('index', preload_data),
    })


def redirect_to_index(request):
    return redirect('/')
