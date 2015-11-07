from api.v2 import BaseView
from search.models import search_works, suggest_works


def _to_dict(work):
    return {
        'title': work.title,
        'n': work.record_count,
        'id': work.work_id,
        }


class SearchView(BaseView):
    def get(self, request):
        q = request.GET['q']
        min_record_count = int(request.GET.get('min_record_count', 2))
        return map(_to_dict, search_works(q, min_record_count)[:30])


class SuggestView(BaseView):
    def get(self, request):
        q = request.GET['q']
        return map(_to_dict, suggest_works(q)[:30])
