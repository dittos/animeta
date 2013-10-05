from django.test import TestCase
from django.test.client import Client
from django.contrib.auth.models import User

class TestRecordViews(TestCase):
    fixtures = ['users', 'records']

    def setUp(self):
        self.client.login(username='ditto', password='test')

    def test_add_record(self):
        rv = self.client.get('/records/add/')
        self.assertEquals(200, rv.status_code)
        data = {
            'work_title': 'hello',
            'category': '',
            'status_type': 'finished',
            'status': '123',
            'comment': 'hello',
        }
        rv = self.client.post('/records/add/', data)
        self.assertEquals(302, rv.status_code)
        self._assert_latest_record(data)

    def test_update_record(self):
        rv = self.client.get('/records/1/update/')
        self.assertEquals(200, rv.status_code)
        data = {
            'status_type': 'watching',
            'status': '123',
            'comment': 'hello 2',
        }
        rv = self.client.post('/records/1/update/', data)
        self.assertEquals(302, rv.status_code)
        self._assert_latest_record(data)

    def test_update_record_title(self):
        rv = self.client.get('/records/1/update/')
        self.assertEquals(200, rv.status_code)
        data = { 'work_title': 'test2' }
        rv = self.client.post('/records/1/update/', data)
        self.assertEquals(302, rv.status_code)
        user = User.objects.get(username='ditto')
        record = user.record_set.latest('id')
        self.assertEquals('test2', record.title)

    def _assert_latest_record(self, data):
        user = User.objects.get(username='ditto')
        record = user.record_set.latest('id')
        history = user.history_set.latest('id')
        if 'work_title' in data:
            self.assertEquals(data['work_title'], record.title)
        self.assertEquals(data['status_type'], record.status_type.name)
        self.assertEquals(data['status'], record.status)
        self.assertEquals(record.work, history.work)
        self.assertEquals(record.status_type, history.status_type)
        self.assertEquals(record.status, history.status)
        self.assertEquals(data['comment'], history.comment)
