import json
from django.http import HttpResponse
from django.shortcuts import render
from search.models import search_works, suggest_works

def _to_dict(work):
    return {
        'title': work.title,
        'n': work.record_count,
    }

def search(request):
    q = request.GET['q']
    result = map(_to_dict, search_works(q))
    return HttpResponse(json.dumps(result), content_type='application/json')

def suggest(request):
    q = request.GET['q']
    result = map(_to_dict, suggest_works(q))
    return HttpResponse(json.dumps(result), content_type='application/json')
