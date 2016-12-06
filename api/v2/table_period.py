from django.core.cache import cache
from api.v2 import BaseView
from api.serializers import serialize_work, serialize_record
from search.models import WorkPeriodIndex
from animeta.utils.table import Period


class TablePeriodView(BaseView):
    def get(self, request, period):
        period = Period.parse(period)
        cache_key = 'table:%s' % period
        only_first_period = request.GET.get('only_first_period') == 'true'
        if only_first_period:
            cache_key += ':first_only'
        data = cache.get(cache_key)
        if data is None:
            indexes = WorkPeriodIndex.objects.select_related('work', 'work__index') \
                .filter(period=str(period))
            if only_first_period:
                indexes = indexes.exclude(is_first_period=False)
            data = [serialize_work(index.work) for index in indexes]
            cache.set(cache_key, data, 60 * 60)
        if request.user.is_authenticated():
            records = {}
            work_ids = [work['id'] for work in data]
            for record in request.user.record_set.filter(work_id__in=work_ids):
                records[record.work_id] = serialize_record(record)
            for work in data:
                if work['id'] in records:
                    work['record'] = records[work['id']]
        return data
