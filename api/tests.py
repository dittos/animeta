import uuid
import json
from django.test import TestCase
from django.contrib.auth.models import User
from record.models import Record, History
from work.models import Work
from api.serializers import serialize_datetime

def new_user():
    return User.objects.create_user(
        uuid.uuid4().hex[:10],
        password='secret'
    )

def new_record(user):
    work = Work.objects.create(title=uuid.uuid4().hex)
    return Record.objects.create(
        user=user,
        work=work
    )

def new_post(record, status, status_type):
    return History.objects.create(
        user=record.user,
        work=record.work,
        status=status,
        status_type=status_type
    )

class UserViewTest(TestCase):
    def test_get(self):
        user = new_user()
        response = self.client.get('/api/v2/users/' + user.username)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), {
            'id': user.id,
            'name': user.username,
            'date_joined': serialize_datetime(user.date_joined),
            'connected_services': [],
            'categories': []
        })

class UserCategoriesViewTest(TestCase):
    def test_create(self):
        name = uuid.uuid4().hex[:30]
        user = new_user()

        response = self.client.post(
            '/api/v2/users/' + user.username + '/categories',
            {'name': name}
        )
        self.assertEqual(response.status_code, 401)

        user2 = new_user()
        self.client.login(username=user2.username, password='secret')
        response = self.client.post(
            '/api/v2/users/' + user.username + '/categories',
            {'name': name}
        )
        self.assertEqual(response.status_code, 403)

        self.client.login(username=user.username, password='secret')
        
        response = self.client.post(
            '/api/v2/users/' + user.username + '/categories',
            {'name': ''}
        )
        self.assertEqual(response.status_code, 400)

        response = self.client.post(
            '/api/v2/users/' + user.username + '/categories',
            {'name': name}
        )
        self.assertEqual(response.status_code, 200)
        category = json.loads(response.content)
        self.assertTrue('id' in category)
        self.assertEqual(category['name'], name)

        response = self.client.get('/api/v2/users/' + user.username)
        self.assertEqual(response.status_code, 200)
        user = json.loads(response.content)
        self.assertEqual(user['categories'], [category])

    def test_reorder(self):
        user = new_user()

        response = self.client.put(
            '/api/v2/users/' + user.username + '/categories'
        )
        self.assertEqual(response.status_code, 401)

        user2 = new_user()
        self.client.login(username=user2.username, password='secret')
        response = self.client.put(
            '/api/v2/users/' + user.username + '/categories'
        )

        self.client.login(username=user.username, password='secret')

        categories = []
        for x in range(2):
            name = uuid.uuid4().hex[:30]
            response = self.client.post(
                '/api/v2/users/' + user.username + '/categories',
                {'name': name}
            )
            categories.append(json.loads(response.content))

        response = self.client.put('/api/v2/users/' + user.username + '/categories', data='ids[]=%d&ids[]=%d' % (categories[1]['id'], categories[0]['id']))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), [categories[1], categories[0]])

        response = self.client.put('/api/v2/users/' + user.username + '/categories', data='ids[]=%d' % categories[1]['id'])
        self.assertEqual(response.status_code, 409)

        response = self.client.put('/api/v2/users/' + user.username + '/categories', data='ids[]=blag')
        self.assertEqual(response.status_code, 409)

        response = self.client.get('/api/v2/users/' + user.username)
        self.assertEqual(response.status_code, 200)
        user = json.loads(response.content)
        self.assertEqual(user['categories'], [categories[1], categories[0]])

class CategoryViewTest(TestCase):
    def test_delete(self):
        user = new_user()
        # TODO: unauthorized
        # TODO: other user's category
        
        self.client.login(username=user.username, password='secret')
        name = uuid.uuid4().hex[:30]
        response = self.client.post(
            '/api/v2/users/' + user.username + '/categories',
            {'name': name}
        )
        category = json.loads(response.content)

        response = self.client.delete(
            '/api/v2/categories/%d' % category['id']
        )
        self.assertEqual(response.status_code, 200)
        
        response = self.client.get('/api/v2/users/' + user.username)
        user = json.loads(response.content)
        self.assertEqual(user['categories'], [])
        # TODO: check record category unset

    def test_edit_name(self):
        user = new_user()
        # TODO: unauthorized
        # TODO: other user's category
        
        self.client.login(username=user.username, password='secret')
        name = uuid.uuid4().hex[:30]
        response = self.client.post(
            '/api/v2/users/' + user.username + '/categories',
            {'name': name}
        )
        category = json.loads(response.content)

        # TODO: empty name
        name2 = uuid.uuid4().hex[:30]
        response = self.client.post(
            '/api/v2/categories/%d' % category['id'],
            {'name': name2}
        )
        self.assertEqual(response.status_code, 200)
        category['name'] = name2
        self.assertEqual(json.loads(response.content), category)
        
        response = self.client.get('/api/v2/users/' + user.username)
        user = json.loads(response.content)
        self.assertEqual(user['categories'], [category])

class PostViewTest(TestCase):
    def test_delete(self):
        user = new_user()
        record = new_record(user)
        post1 = new_post(record, 'a', 'watching')
        post2 = new_post(record, 'b', 'finished')

        self.client.login(username=user.username, password='secret')
        response = self.client.delete('/api/v2/posts/%d' % post2.id)
        self.assertEqual(response.status_code, 200)
        result = json.loads(response.content)
        self.assertEqual(result['record']['status'], post1.status)
        self.assertEqual(result['record']['status_type'], post1.status_type)
        # TODO: check post deleted from record

        response = self.client.delete('/api/v2/posts/%d' % post1.id)
        self.assertEqual(response.status_code, 422)

class UserPostsViewTest(TestCase):
    def test_get(self):
        user = new_user()
        record = new_record(user)
        post1 = new_post(record, 'a', 'watching')
        post2 = new_post(record, 'b', 'finished')

        response = self.client.get('/api/v2/users/' + user.username + '/posts')
        self.assertEqual(response.status_code, 200)
        result = json.loads(response.content)
        self.assertEqual(len(result), 2)
        # TODO: check content

        response = self.client.get('/api/v2/users/' + user.username + '/posts', {'before_id': post2.id})
        self.assertEqual(response.status_code, 200)
        result = json.loads(response.content)
        self.assertEqual(len(result), 1)
        # TODO: check content

class UserRecordsViewTest(TestCase):
    def test_get(self):
        user = new_user()
        record1 = new_record(user)
        new_post(record1, 'A', 'finished')
        record2 = new_record(user)
        new_post(record2, 'B', 'watching')

        self.client.login(username=user.username, password='secret')
        response = self.client.get('/api/v2/users/' + user.username + '/records')
        self.assertEqual(response.status_code, 200)
        # TODO: check content

    def test_post(self):
        user = new_user()
        self.client.login(username=user.username, password='secret')
        response = self.client.post('/api/v2/users/' + user.username + '/records', {
            'work_title': uuid.uuid4().hex,
            'status_type': 'watching'
        })
        self.assertEqual(response.status_code, 200)
        # TODO: check content

class RecordViewTest(TestCase):
    def test_get(self):
        user = new_user()
        record = new_record(user)

        response = self.client.get('/api/v2/records/%d' % record.id)
        self.assertEqual(response.status_code, 200)
        # TODO: check content

    def test_edit(self):
        user = new_user()
        record = new_record(user)

        self.client.login(username=user.username, password='secret')
        response = self.client.post('/api/v2/records/%d' % record.id, {
            'title': uuid.uuid4().hex,
            'category_id': ''
        })
        self.assertEqual(response.status_code, 200)
        # TODO: check content

    def test_delete(self):
        user = new_user()
        record = new_record(user)

        self.client.login(username=user.username, password='secret')
        response = self.client.delete('/api/v2/records/%d' % record.id)
        self.assertEqual(response.status_code, 200)

class RecordPostsViewTest(TestCase):
    def test_get(self):
        user = new_user()
        record = new_record(user)
        post = new_post(record, 'a', 'watching')

        response = self.client.get('/api/v2/records/%d/posts' % record.id)
        self.assertEqual(response.status_code, 200)
        # TODO: check content

    def test_add(self):
        user = new_user()
        record = new_record(user)
        new_post(record, 'a', 'watching')

        self.client.login(username=user.username, password='secret')
        response = self.client.post('/api/v2/records/%d/posts' % record.id, {
            'status': 'b',
            'status_type': 'finished',
            'comment': '',
        })
        self.assertEqual(response.status_code, 200)
        # TODO: check content
