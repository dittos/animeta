import collections
from django.db.models import Count
from record.models import StatusType


class RecordFilter(object):
    def __init__(self, status_type, category_id, category_id_set):
        '''
        :param status_type: record.models.StatusType
        :param category_id: int?
        :param category_id_set: bool
        :return:
        '''
        assert status_type is None or isinstance(status_type, StatusType)
        assert category_id != 0
        assert category_id_set or category_id is None
        self.status_type = status_type
        self.status_type_set = status_type is not None
        self.category_id = category_id
        self.category_id_set = category_id_set

    def without_status_type(self):
        if self.status_type_set:
            return RecordFilter(
                status_type=None,
                category_id=self.category_id,
                category_id_set=self.category_id_set,
            )
        return self

    def without_category_id(self):
        if self.category_id_set:
            return RecordFilter(
                status_type=self.status_type,
                category_id=None,
                category_id_set=False,
            )
        return self


def filter_counts(counts, record_filter):
    if record_filter.status_type_set:
        counts = [row for row in counts if row['status_type'] == record_filter.status_type]
    if record_filter.category_id_set:
        counts = [row for row in counts if row['category_id'] == record_filter.category_id]
    return counts


def count(user, record_filter):
    counts = list(user.record_set.values('status_type', 'category_id').annotate(Count('id')))

    filtered_counts = filter_counts(counts, record_filter)

    count_by_status_type = collections.defaultdict(lambda: 0)
    count_by_status_type['_all'] = 0
    for row in filter_counts(counts, record_filter.without_status_type()):
        count_by_status_type['_all'] += row['id__count']
        count_by_status_type[StatusType(row['status_type']).name] += row['id__count']

    count_by_category_id = collections.defaultdict(lambda: 0)
    count_by_category_id['_all'] = 0
    for row in filter_counts(counts, record_filter.without_category_id()):
        count_by_category_id['_all'] += row['id__count']
        count_by_category_id[row['category_id'] or '0'] += row['id__count']

    return {
        'total': sum(row['id__count'] for row in counts),
        'filtered': sum(row['id__count'] for row in filtered_counts),
        'by_status_type': count_by_status_type,
        'by_category_id': count_by_category_id,
    }
