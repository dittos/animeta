from django.core.cache import cache
from api.v2 import BaseView
from api.serializers import serialize_work
from chart.models import weekly, compare_charts, PopularWorksChart


class PopularWorksChartView(BaseView):
    range_func = staticmethod(weekly)  # For test injection

    def get(self, request):
        def _serialize(item):
            work = item['object']
            item['object'] = serialize_work(work)
            return item
        w = PopularWorksChartView.range_func()
        limit = int(request.GET['limit'])
        cache_key = '/charts/works/weekly/%s?limit=%d' % (str(w.sunday), limit)
        result = cache.get(cache_key)
        if result is None:
            chart = compare_charts(
                PopularWorksChart(w, limit),
                PopularWorksChart(w.prev())
            )
            result = map(_serialize, chart)
            cache.set(cache_key, result, 60 * 60)
        return result
