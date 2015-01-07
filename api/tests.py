import uuid
from django.test import TestCase, Client
from django.contrib.auth.models import User
from record.models import Record, History
from work.models import Work
from api.serializers import serialize_datetime

class TestContext(Client):
    def __init__(self):
        super(TestContext, self).__init__()
        self.username = uuid.uuid4().hex[:10]
        password = 'secret'
        self.user = User.objects.create_user(
            self.username,
            password=password
        )
        self.login(username=self.username, password=password)

    @property
    def user_path(self):
        return '/api/v2/users/%s' % self.username

    def new_record(self, **kwargs):
        data = {
            'work_title': uuid.uuid4().hex,
            'status_type': 'watching',
        }
        data.update(kwargs)
        response = self.post(self.user_path + '/records', data)
        return response.obj['record']

    def new_post(self, record_id, **kwargs):
        data = {
            'status': uuid.uuid4().hex[:10],
            'status_type': 'watching',
            'comment': '',
        }
        data.update(kwargs)
        response = self.post('/api/v2/records/%s/posts' % record_id, data)
        return response.obj['post']

    def new_category(self, **kwargs):
        data = {
            'name': uuid.uuid4().hex[:30],
        }
        data.update(kwargs)
        response = self.post(self.user_path + '/categories', data)
        return response.obj

class UserViewTest(TestCase):
    def test_get(self):
        context = TestContext()
        response = self.client.get(context.user_path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.obj, {
            'id': context.user.id,
            'name': context.user.username,
            'date_joined': serialize_datetime(context.user.date_joined),
            'connected_services': [],
            'categories': []
        })

class UserCategoriesViewTest(TestCase):
    def test_create(self):
        name = uuid.uuid4().hex[:30]
        context = TestContext()
        path = context.user_path + '/categories'

        # Unauthorized
        response = self.client.post(path, {'name': name})
        self.assertEqual(response.status_code, 401)

        # Other user
        context2 = TestContext()
        response = context2.post(path, {'name': name})
        self.assertEqual(response.status_code, 403)

        # Empty name
        response = context.post(path, {'name': ''})
        self.assertEqual(response.status_code, 400)

        # Normal case
        response = context.post(path, {'name': name})
        self.assertEqual(response.status_code, 200)
        category = response.obj
        self.assertTrue('id' in category)
        self.assertEqual(category['name'], name)

        response = context.get(context.user_path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.obj['categories'], [category])

    def test_reorder(self):
        context = TestContext()
        path = context.user_path + '/categories'

        # Unauthorized
        response = self.client.put(path)
        self.assertEqual(response.status_code, 401)

        # Other user
        context2 = TestContext()
        response = context2.put(path)
        self.assertEqual(response.status_code, 403)

        # Create some categories
        categories = []
        for x in range(2):
            categories.append(context.new_category())

        # Try swapping order
        response = context.put(path, data='ids[]=%s&ids[]=%s' % (categories[1]['id'], categories[0]['id']))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.obj, [categories[1], categories[0]])

        response = context.get(context.user_path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.obj['categories'], [categories[1], categories[0]])

        # Try specifing partial order (should fail)
        response = context.put(path, data='ids[]=%s' % categories[1]['id'])
        self.assertEqual(response.status_code, 409)

        # Try specifing other ID (should fail)
        response = context.put(path, data='ids[]=blag')
        self.assertEqual(response.status_code, 409)

class CategoryViewTest(TestCase):
    def test_delete(self):
        context = TestContext()
        
        # Create a category and add a record in the category
        category = context.new_category()
        record = context.new_record(category_id=category['id'])
        path = '/api/v2/categories/%s' % category['id']

        # Unauthorized
        response = self.client.delete(path)
        self.assertEqual(response.status_code, 401)

        # Other user
        context2 = TestContext()
        response = context2.delete(path)
        self.assertEqual(response.status_code, 403)

        # Normal case
        response = context.delete(path)
        self.assertEqual(response.status_code, 200)
        
        # Should disappear from categories
        response = context.get(context.user_path)
        self.assertEqual(response.obj['categories'], [])

        # Should unset record's category
        response = context.get('/api/v2/records/%s' % record['id'])
        self.assertEqual(response.obj['category_id'], None)

    def test_edit_name(self):
        context = TestContext()

        # Create a category to edit name
        category = context.new_category()
        path = '/api/v2/categories/%s' % category['id']
        name2 = uuid.uuid4().hex[:30]

        # Unauthorized
        response = self.client.post(path, {'name': name2})
        self.assertEqual(response.status_code, 401)

        # Other user
        context2 = TestContext()
        response = context2.post(path, {'name': name2})
        self.assertEqual(response.status_code, 403)

        # Normal case
        response = context.post(path, {'name': name2})
        self.assertEqual(response.status_code, 200)
        category['name'] = name2
        self.assertEqual(response.obj, category)
        
        response = context.get(context.user_path)
        self.assertEqual(response.obj['categories'], [category])

        # Should not accept empty name
        response = context.post(path, {'name': ''})
        self.assertEqual(response.status_code, 400)

class PostViewTest(TestCase):
    def test_delete(self):
        context = TestContext()
        record = context.new_record(status_type='watching')
        post1 = context.new_post(record['id'], status='a', status_type='watching')
        post2 = context.new_post(record['id'], status='b', status_type='finished')
        path = '/api/v2/posts/%s' % post2['id']

        # Unauthorized
        response = self.client.delete(path)
        self.assertEqual(response.status_code, 401)

        # Other user
        context2 = TestContext()
        response = context2.delete(path)
        self.assertEqual(response.status_code, 403)

        # Normal case
        response = context.delete(path)
        self.assertEqual(response.status_code, 200)
        updated_record = response.obj['record']
        self.assertEqual(updated_record['status'], post1['status'])
        self.assertEqual(updated_record['status_type'], post1['status_type'])

        # The post should be removed from record
        response = context.get('/api/v2/records/%s/posts' % record['id'])
        post_ids = [str(post['id']) for post in response.obj['posts']]
        self.assertTrue(str(post2['id']) not in post_ids)

        # The post should be removed from user posts
        response = context.get(context.user_path + '/posts')
        post_ids = [str(post['id']) for post in response.obj]
        self.assertTrue(str(post2['id']) not in post_ids)

        # Should not allow deleting the last one post of a record
        context.delete('/api/v2/posts/%s' % post1['id'])
        response = context.delete('/api/v2/posts/%s' % post_ids[-1])
        self.assertEqual(response.status_code, 422)

class UserPostsViewTest(TestCase):
    def test_get(self):
        context = TestContext()
        record = context.new_record()
        post1 = context.new_post(record['id'])
        post2 = context.new_post(record['id'])
        record = self.client.get('/api/v2/records/%s' % record['id']).obj

        response = self.client.get(context.user_path + '/posts')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.obj), 3)
        post1['record'] = post2['record'] = record
        self.assertEqual(response.obj[0], post2)
        self.assertEqual(response.obj[1], post1)

        response = self.client.get(context.user_path + '/posts', {'before_id': post2['id']})
        self.assertEqual(response.status_code, 200)
        result = response.obj
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]['id'], post1['id'])

class UserRecordsViewTest(TestCase):
    def test_get(self):
        context = TestContext()
        record1 = context.new_record()
        record2 = context.new_record()

        response = self.client.get(context.user_path + '/records')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.obj), 2)
        self.assertEqual(response.obj[0], record2)
        self.assertEqual(response.obj[1], record1)

    def test_post(self):
        context = TestContext()
        path = context.user_path + '/records'
        data = {
            'work_title': uuid.uuid4().hex,
            'status_type': 'watching'
        }

        # Unauthorized
        response = self.client.post(path, data)
        self.assertEqual(response.status_code, 401)

        # Other user
        context2 = TestContext()
        response = context2.post(path, data)
        self.assertEqual(response.status_code, 403)

        # Fails without title
        response = context.post(path, {'work_title': ''})
        self.assertEqual(response.status_code, 400)

        # Normal case
        response = context.post(path, data)
        self.assertEqual(response.status_code, 200)
        record = response.obj['record']
        post = response.obj['post']

        self.assertTrue('id' in record)
        self.assertEqual(record['user_id'], context.user.id)
        self.assertEqual(record['category_id'], None)
        self.assertEqual(record['title'], data['work_title'])
        self.assertEqual(record['status'], '')
        self.assertEqual(record['status_type'], data['status_type'])
        self.assertTrue('updated_at' in record)

        self.assertTrue('id' in post)
        self.assertEqual(post['record_id'], record['id'])
        self.assertEqual(post['status'], '')
        self.assertEqual(post['status_type'], data['status_type'])
        self.assertEqual(post['comment'], '')
        self.assertTrue('updated_at' in post)

        # Adding a record with already existing title is not allowed
        response = context.post(path, data)
        self.assertEqual(response.status_code, 422)

class RecordViewTest(TestCase):
    def test_get(self):
        context = TestContext()
        record = context.new_record()

        response = self.client.get('/api/v2/records/%s' % record['id'])
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.obj, record)

    def test_edit(self):
        context = TestContext()
        category = context.new_category()
        record = context.new_record()
        path = '/api/v2/records/%s' % record['id']
        data = {
            'title': uuid.uuid4().hex,
            'category_id': category['id']
        }

        # Unauthorized
        response = self.client.post(path, data)
        self.assertEqual(response.status_code, 401)

        # Other user
        context2 = TestContext()
        response = context2.post(path, data)
        self.assertEqual(response.status_code, 403)

        # Normal case
        response = context.post(path, data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.obj['title'], data['title'])
        self.assertEqual(response.obj['category_id'], data['category_id'])

        # Update to already existing record title is not allowed
        record2 = context.new_record()
        response = context.post(path, {'title': record2['title']})
        self.assertEqual(response.status_code, 422)

        # Updating without category field should not unset category
        response = context.post(path, {})
        self.assertEqual(response.obj['category_id'], category['id'])

        # Updating with null category field should unset category
        response = context.post(path, {'category_id': ''})
        self.assertEqual(response.obj['category_id'], None)

    def test_delete(self):
        context = TestContext()
        record = context.new_record()
        path = '/api/v2/records/%s' % record['id']

        # Unauthorized
        response = self.client.delete(path)
        self.assertEqual(response.status_code, 401)

        # Other user
        context2 = TestContext()
        response = context2.delete(path)
        self.assertEqual(response.status_code, 403)

        # Normal case
        response = context.delete(path)
        self.assertEqual(response.status_code, 200)

class RecordPostsViewTest(TestCase):
    def test_get(self):
        context = TestContext()
        record = context.new_record()
        post = context.new_post(record['id'])

        response = self.client.get('/api/v2/records/%s/posts' % record['id'])
        self.assertEqual(response.status_code, 200)
        posts = response.obj['posts']
        self.assertEqual(len(posts), 2)
        self.assertEqual(posts[0], post)
        self.assertEqual(posts[1]['record_id'], record['id'])

    def test_add(self):
        context = TestContext()
        record = context.new_record()
        path = '/api/v2/records/%s/posts' % record['id']
        data = {
            'status': 'b',
            'status_type': 'finished',
            'comment': 'hello',
        }

        # Unauthorized
        response = self.client.post(path, data)
        self.assertEqual(response.status_code, 401)

        # Other user
        context2 = TestContext()
        response = context2.post(path, data)
        self.assertEqual(response.status_code, 403)

        # Normal case
        response = context.post(path, data)
        self.assertEqual(response.status_code, 200)
        updated_record = response.obj['record']
        post = response.obj['post']

        self.assertTrue('id' in updated_record)
        self.assertEqual(updated_record['user_id'], context.user.id)
        self.assertEqual(updated_record['category_id'], record['category_id'])
        self.assertEqual(updated_record['title'], record['title'])
        self.assertEqual(updated_record['status'], data['status'])
        self.assertEqual(updated_record['status_type'], data['status_type'])
        self.assertNotEqual(updated_record['updated_at'], record['updated_at'])

        self.assertTrue('id' in post)
        self.assertEqual(post['record_id'], record['id'])
        self.assertEqual(post['status'], data['status'])
        self.assertEqual(post['status_type'], data['status_type'])
        self.assertEqual(post['comment'], data['comment'])
        self.assertTrue('updated_at' in post)

        # TODO: publish_twitter
