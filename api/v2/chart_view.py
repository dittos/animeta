from django.core.cache import cache
from api.v2 import BaseView
from api.serializers import serialize_work
from chart.models import weekly, compare_charts, PopularWorksChart, monthly


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


class ChartView(BaseView):
    range_func = staticmethod(weekly)  # For test injection
    chart_class = None

    def get(self, request, range):
        if range == 'weekly':
            range_obj = weekly()
        elif range == 'monthly':
            range_obj = monthly()
        else:
            range_obj = None

        limit = int(request.GET['limit'])

        def serialize_chart(chart, limit):
            data = {}
            if chart.range:
                data['start'] = chart.start.strftime('%Y-%m-%d')
                data['end'] = chart.end.strftime('%Y-%m-%d')
                data['has_diff'] = True
            else:
                data['has_diff'] = False
            items = []
            for item in chart:
                if item['rank'] > limit:
                    break
                item['object'] = {
                    'link': item['object'].get_absolute_url(),
                    'text': unicode(item['object'])
                }
                items.append(item)
            data['items'] = items
            return data

        cache_key = '/charts/{}/{}/{}?limit=%d'.format(
            self.chart_class.__name__, range, limit)
        result = cache.get(cache_key)
        if result is None:
            if range_obj:
                chart = compare_charts(self.chart_class(range_obj, limit),
                                       self.chart_class(range_obj.prev()))
            else:
                chart = self.chart_class(limit=limit)
            result = serialize_chart(chart, limit)
            result['title'] = self.chart_class.title
            cache.set(cache_key, result, 60 * 60 * 2)
        return result
