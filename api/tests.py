# -*- coding: utf-8 -*-
import uuid
from django.contrib.auth.models import User
from django.test import TestCase, Client
import mock
import tweepy
from connect.models import TwitterSetting
from search import indexer
from work.models import Work


class TestContext(Client):
    def __init__(self):
        super(TestContext, self).__init__()
        self.username = uuid.uuid4().hex[:10]
        password = 'secret'
        response = self.post('/api/v2/accounts', {
            'username': self.username,
            'password1': password,
            'password2': password
        })
        self.user = response.json()['user']
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
        return response.json()['record']

    def new_post(self, record_id, **kwargs):
        data = {
            'status': uuid.uuid4().hex[:10],
            'status_type': 'watching',
            'comment': '',
        }
        data.update(kwargs)
        response = self.post('/api/v2/records/%s/posts' % record_id, data)
        return response.json()['post']

    def new_category(self, **kwargs):
        data = {
            'name': uuid.uuid4().hex[:30],
        }
        data.update(kwargs)
        response = self.post(self.user_path + '/categories', data)
        return response.json()

    def add_twitter_setting(self):
        user = User.objects.get(username=self.username)
        TwitterSetting.objects.create(
            user=user,
            key='key',
            secret='secret',
        )


class AuthViewTest(TestCase):
    def test_post(self):
        response = Client().post('/api/v2/accounts', {
            'username': 'ditto',
            'password1': 'a',
            'password2': 'a',
        })
        self.assertTrue(response.json()['ok'])

        response = self.client.post('/api/v2/auth', {
            'username': 'ditto',
            'password': 'wrong',
        })
        self.assertFalse(response.json()['ok'])

        response = self.client.get('/api/v2/auth')
        self.assertFalse(response.json()['ok'])

        response = self.client.post('/api/v2/auth', {
            'username': 'ditto',
            'password': 'a',
        })
        self.assertTrue(response.json()['ok'])

        response = self.client.get('/api/v2/auth')
        self.assertTrue(response.json()['ok'])

    def test_delete(self):
        response = self.client.delete('/api/v2/auth')
        self.assertEqual(response.status_code, 200)

        response = self.client.get('/api/v2/auth')
        self.assertFalse(response.json()['ok'])


class AccountsViewTest(TestCase):
    def test_post(self):
        response = self.client.post('/api/v2/accounts')
        self.assertFalse(response.json()['ok'])

        response = self.client.post('/api/v2/accounts', {
            'username': '',
        })
        self.assertFalse(response.json()['ok'])

        response = self.client.post('/api/v2/accounts', {
            'username': 'a' * 31,
        })
        self.assertFalse(response.json()['ok'])

        response = self.client.post('/api/v2/accounts', {
            'username': 'a/b',
        })
        self.assertFalse(response.json()['ok'])

        response = self.client.post('/api/v2/accounts', {
            'username': 'ditto',
            'password1': 'a',
            'password2': 'a',
        })
        self.assertTrue(response.json()['ok'])

        # Logged in automatically
        response = self.client.get('/api/v2/auth')
        self.assertTrue(response.json()['ok'])

        response = self.client.post('/api/v2/accounts', {
            'username': 'ditto',
            'password1': 'a',
            'password2': 'a',
        })
        self.assertFalse(response.json()['ok'])
        self.assertTrue('username' in response.json()['errors'])


class UserViewTest(TestCase):
    def test_get(self):
        context = TestContext()
        context.add_twitter_setting()  # Check connected_services
        response = self.client.get(context.user_path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), context.user)

    def test_get_current_user(self):
        context = TestContext()
        path = '/api/v2/me'

        # Not logged in
        response = self.client.get(path)
        self.assertEqual(response.status_code, 403)

        # Logged in
        response = context.get(path)
        expected_response = context.get(context.user_path)
        self.assertEqual(response.json(), expected_response.json())


class UserPasswordViewTest(TestCase):
    def test_post(self):
        context = TestContext()
        path = '/api/v2/me/password'

        # Not logged in
        response = self.client.post(path, {
            'old_password': 'secret',
            'new_password1': 'new-secret',
            'new_password2': 'new-secret',
        })
        self.assertEqual(response.status_code, 403)

        # Wrong old password
        response = context.post(path, {
            'old_password': 'wrong',
            'new_password1': 'new-secret',
            'new_password2': 'new-secret',
        })
        self.assertEqual(response.status_code, 403)

        # Wrong new password verification
        response = context.post(path, {
            'old_password': 'secret',
            'new_password1': 'new-secret',
            'new_password2': 'wrong',
        })
        self.assertEqual(response.status_code, 400)

        # Success
        response = context.post(path, {
            'old_password': 'secret',
            'new_password1': 'new-secret',
            'new_password2': 'new-secret',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['ok'])

        # Old password -> fail
        response = self.client.post('/api/v2/auth', {
            'username': context.username,
            'password': 'secret',
        })
        self.assertFalse(response.json()['ok'])

        # New password -> pass
        response = self.client.post('/api/v2/auth', {
            'username': context.username,
            'password': 'new-secret',
        })
        self.assertTrue(response.json()['ok'])


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
        category = response.json()
        self.assertTrue('id' in category)
        self.assertEqual(category['name'], name)

        response = context.get(context.user_path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['categories'], [category])

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
        self.assertEqual(response.json(), [categories[1], categories[0]])

        response = context.get(context.user_path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['categories'], [categories[1], categories[0]])

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
        self.assertEqual(response.json()['categories'], [])

        # Should unset record's category
        response = context.get('/api/v2/records/%s' % record['id'])
        self.assertEqual(response.json()['category_id'], None)

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
        self.assertEqual(response.json(), category)
        
        response = context.get(context.user_path)
        self.assertEqual(response.json()['categories'], [category])

        # Should not accept empty name
        response = context.post(path, {'name': ''})
        self.assertEqual(response.status_code, 400)

class PostViewTest(TestCase):
    def test_get(self):
        context = TestContext()
        record = context.new_record()
        post = context.new_post(record['id'], status='a', status_type='watching')
        path = '/api/v2/posts/%s' % post['id']

        response = self.client.get(path)
        post['user'] = self.client.get(context.user_path).json()
        post['record'] = self.client.get('/api/v2/records/%s' % record['id']).json()
        del post['user']['categories']
        del post['record']['user']
        self.assertEqual(response.json(), post)

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
        updated_record = response.json()['record']
        self.assertEqual(updated_record['status'], post1['status'])
        self.assertEqual(updated_record['status_type'], post1['status_type'])

        # The post should be removed from record
        response = context.get('/api/v2/records/%s/posts' % record['id'])
        post_ids = [str(post['id']) for post in response.json()['posts']]
        self.assertTrue(str(post2['id']) not in post_ids)

        # The post should be removed from user posts
        response = context.get(context.user_path + '/posts')
        post_ids = [str(post['id']) for post in response.json()]
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
        record = self.client.get('/api/v2/records/%s' % record['id']).json()

        response = self.client.get(context.user_path + '/posts')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 3)
        del record['user']
        post1['record'] = post2['record'] = record
        self.assertEqual(response.json()[0], post2)
        self.assertEqual(response.json()[1], post1)

        response = self.client.get(context.user_path + '/posts', {'before_id': post2['id']})
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]['id'], post1['id'])

class UserRecordsViewTest(TestCase):
    def test_get(self):
        context = TestContext()
        record1 = context.new_record()
        record2 = context.new_record()

        response = self.client.get(context.user_path + '/records')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        self.assertEqual(response.json()[0], record2)
        self.assertEqual(response.json()[1], record1)

    def test_get_with_has_newer_episode_flag(self):
        context1 = TestContext()
        record1 = context1.new_record()
        context1.new_post(record1['id'], status='1')
        unaffected_record = context1.new_record()

        context2 = TestContext()
        record2 = context2.new_record(work_title=record1['title'])
        context2.new_post(record2['id'], status='2')

        response = context1.get(context1.user_path + '/records',
                                data={'include_has_newer_episode': 'true'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        self.assertEqual(response.json()[0]['id'], unaffected_record['id'])
        self.assertFalse('has_newer_episode' in response.json()[0])
        self.assertEqual(response.json()[1]['id'], record1['id'])
        self.assertTrue(response.json()[1]['has_newer_episode'])

        # Default is false
        response = context1.get(context1.user_path + '/records')
        self.assertEqual(response.status_code, 200)
        for record in response.json():
            self.assertFalse('has_newer_episode' in record)

        # Non-true value is assumed as false
        response = context1.get(context1.user_path + '/records',
                                data={'include_has_newer_episode': 'falsey'})
        self.assertEqual(response.status_code, 200)
        for record in response.json():
            self.assertFalse('has_newer_episode' in record)

        # Not allowed for unauthenticated user
        response = self.client.get(context1.user_path + '/records',
                                   data={'include_has_newer_episode': 'true'})
        self.assertEqual(response.status_code, 200)
        for record in response.json():
            self.assertFalse('has_newer_episode' in record)

        # Not allowed for unauthenticated user
        response = context2.get(context1.user_path + '/records',
                                data={'include_has_newer_episode': 'true'})
        self.assertEqual(response.status_code, 200)
        for record in response.json():
            self.assertFalse('has_newer_episode' in record)

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
        record = response.json()['record']
        post = response.json()['post']

        self.assertTrue('id' in record)
        self.assertEqual(record['user_id'], context.user['id'])
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
        obj = response.json()
        del obj['user']
        self.assertEqual(obj, record)

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
        self.assertEqual(response.json()['title'], data['title'])
        self.assertEqual(response.json()['category_id'], data['category_id'])

        # Update to already existing record title is not allowed
        record2 = context.new_record()
        response = context.post(path, {'title': record2['title']})
        self.assertEqual(response.status_code, 422)

        # Updating without category field should not unset category
        response = context.post(path, {})
        self.assertEqual(response.json()['category_id'], category['id'])

        # Updating with null category field should unset category
        response = context.post(path, {'category_id': ''})
        self.assertEqual(response.json()['category_id'], None)

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
        posts = response.json()['posts']
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
        updated_record = response.json()['record']
        post = response.json()['post']

        self.assertTrue('id' in updated_record)
        self.assertEqual(updated_record['user_id'], context.user['id'])
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

    def test_add_and_publish_twitter(self):
        context = TestContext()
        record = context.new_record(work_title='A')
        path = '/api/v2/records/%s/posts' % record['id']
        data = {
            'status': 'b123',
            'status_type': 'finished',
            'comment': 'hello',
            'publish_twitter': 'on',
        }

        # Not connected, but success silently
        response = context.post(path, data)
        self.assertEqual(response.status_code, 200)

        # Connected
        context.add_twitter_setting()

        # Sane case
        mock_twitter = mock.MagicMock()
        with mock.patch('connect.twitter.get_api', return_value=mock_twitter):
            response = context.post(path, data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(mock_twitter.update_status.call_count, 1)
        args, kwargs = mock_twitter.update_status.call_args
        status = args[0]
        post_id = response.json()['post']['id']
        self.assertEqual(status, u'A b123화 (완료): hello https://animeta.net/-%s' % post_id)

        # Twitter failure; success silently
        failing_mock_twitter = mock.MagicMock()
        failing_mock_twitter.update_status.side_effect = tweepy.TweepError('mock error')
        with mock.patch('connect.twitter.get_api', return_value=failing_mock_twitter):
            context.post(path, data)
        self.assertEqual(response.status_code, 200)

    def test_add_spoiler(self):
        context = TestContext()
        record = context.new_record(work_title='A')
        path = '/api/v2/records/%s/posts' % record['id']
        data = {
            'status': 'b123',
            'status_type': 'finished',
            'comment': 'hello',
            'contains_spoiler': 'true',
            'publish_twitter': 'on',
        }

        context.add_twitter_setting()

        mock_twitter = mock.MagicMock()
        with mock.patch('connect.twitter.get_api', return_value=mock_twitter):
            response = context.post(path, data)
        self.assertEqual(response.status_code, 200)
        post = response.json()['post']
        self.assertTrue(post['contains_spoiler'])
        self.assertEqual(mock_twitter.update_status.call_count, 1)
        args, kwargs = mock_twitter.update_status.call_args
        status = args[0]
        post_id = post['id']
        self.assertEqual(status, u'A b123화 (완료): [\U0001F507 내용 누설 가림] https://animeta.net/-%s' % post_id)


class WorkViewTest(TestCase):
    def test_get(self):
        context = TestContext()
        title = 'Fate/stay night'
        alt_title = 'Fate stay night'
        record = context.new_record(work_title=title)
        path = '/api/v2/works/%s' % record['work_id']
        post = context.new_post(record['id'], status=u'1', comment=u'comment')
        for x in range(3):
            context2 = TestContext()
            record2 = context2.new_record(work_title=alt_title)
            post2 = context.new_post(record['id'], status=u'2', comment='')

        # Get by ID
        response = self.client.get(path)
        self.assertEqual(response.status_code, 200)
        work = response.json()
        expected = {
            'id': record['work_id'],
            'title': u'Fate/stay night',
            'episodes': [
                {'number': 1, 'post_count': 1},
                {'number': 2}
            ],
            'alt_titles': [u'Fate stay night'],
            'record_count': 4,
        }
        self.assertEqual(work, expected)

        # Should have rank after indexing
        indexer.run()
        response = self.client.get(path)
        self.assertEqual(response.status_code, 200)
        work = response.json()
        expected['rank'] = 1
        self.assertEqual(work, expected)

        # Should have record if logged in
        response = context.get(path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['record']['id'], record['id'])

        # If logged in and no record should not have record field
        context3 = TestContext()
        response = context3.get(path)
        self.assertEqual(response.status_code, 200)
        self.assertTrue('record' not in response.json())

        # Lookup by title
        response = self.client.get('/api/v2/works/_/%s' % title)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), work)
        response = self.client.get('/api/v2/works/_/%s' % alt_title)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), work)

class WorkPostsViewTest(TestCase):
    def test_get(self):
        context = TestContext()
        record = context.new_record()
        post1 = context.new_post(record['id'], status=u'1', comment=u'a')
        post2 = context.new_post(record['id'], status=u'2', comment=u'b')

        path = '/api/v2/works/%d/posts' % record['work_id']
        response = self.client.get(path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        for key in ('id', 'status', 'status_type', 'updated_at', 'comment'):
            self.assertEqual(response.json()[0][key], post2[key])
            self.assertEqual(response.json()[1][key], post1[key])
        for post in response.json():
            self.assertEqual(post['user']['id'], context.user['id'])
            self.assertEqual(post['user']['name'], context.user['name'])

        response = self.client.get(path, {'before_id': post2['id']})
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['id'], post1['id'])

        response = self.client.get(path, {'episode': '2'})
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['id'], post2['id'])

class PostsViewTest(TestCase):
    def test_get(self):
        context = TestContext()
        record_a = context.new_record(work_title='a')
        post_a = context.new_post(record_a['id'], comment='!')
        record_b = context.new_record(work_title='b')
        post_b = context.new_post(record_b['id'], comment='!')

        context2 = TestContext()
        record_a2 = context2.new_record(work_title='a')
        post_a2 = context2.new_post(record_a2['id'], comment='!')

        path = '/api/v2/posts'

        response = self.client.get(path, {'count': 2})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        self.assertEqual(response.json()[0]['id'], post_a2['id'])
        self.assertEqual(response.json()[1]['id'], post_b['id'])

        # Test before_id
        response = self.client.get(path, {'before_id': post_b['id']})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]['id'], post_a['id'])

        # Test min_record_count
        indexer.run() # We need index to use this feature
        response = self.client.get(path, {'min_record_count': 2})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        self.assertEqual(response.json()[0]['id'], post_a2['id'])
        self.assertEqual(response.json()[1]['id'], post_a['id'])


from chart.utils import Week


class PopularWorksChartViewTest(TestCase):
    @mock.patch('api.v2.chart_view.PopularWorksChartView')
    def test_get_weekly(self, mock_chart_view):
        mock_chart_view.range_func.return_value = Week.this()

        context = TestContext()
        record = context.new_record()
        context2 = TestContext()
        context2.new_record(work_title=record['title'])

        response = self.client.get('/api/v2/charts/works/weekly?limit=5')
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]['rank'], 1)
        self.assertEqual(response.json()[0]['factor_percent'], 100.0)
        self.assertEqual(response.json()[0]['object']['id'], record['work_id'])


class TablePeriodViewTest(TestCase):
    def test_get(self):
        context = TestContext()
        work1_id = context.new_record(work_title='A')['work_id']
        work1 = Work.objects.get(id=work1_id)
        work1.raw_metadata = u'''periods: ["2015Q2"]
id: oregairu2
title: 역시 내 청춘 러브코메디는 잘못됐다 속
namu_ref: 역시 내 청춘 러브코메디는 잘못됐다
schedule:
- 04-03 01:46 #금
- TBS
schedule_kr:
- 04-08 23:00 #수
- ANIMAX
source: lightnovel
studio: Feel
ann_id: 16329
image: ann16329.jpg
website: http://www.tbs.co.jp/anime/oregairu/'''
        work1.save()

        work2_id = context.new_record(work_title='B')['work_id']
        work2 = Work.objects.get(id=work2_id)
        work2.raw_metadata = u'''periods: ["2015Q3"]
id: gatchaman-crowds-insight
title: 갓챠맨 크로우즈 인사이트
namu_ref: GATCHAMAN CROWDS
schedule:
- 07-05 01:55 #일
- NTV
schedule_kr:
- 07-08 23:00 #수
- ANIPLUS
source: original
studio: 타츠노코
website: http://www.ntv.co.jp/GC_insight/
ann_id: 16697
image: ann16697.jpg'''
        work2.save()

        work3_id = context.new_record(work_title='C')['work_id']
        work3 = Work.objects.get(id=work3_id)
        work3.raw_metadata = u'''periods: ["2015Q1", "2015Q3"]
id: 059239ce
ann_id: 16098
title: THE IDOLM@STER 신데렐라 걸즈
namu_ref: 아이돌 마스터 신데렐라 걸즈/애니메이션
schedule:
#- 01-10 00:00 #Sat
- 07-18 00:00 #토
- MX
schedule_kr:
#- 01-20 22:30 #Tue
- 07-28 22:30 #화
- ANIPLUS
image: ann16098.jpg
source: game
studio: A-1 픽쳐스
website: http://imas-cinderella.com/'''
        work3.save()

        indexer.run()

        path = '/api/v2/table/periods/2015Q3'

        response = self.client.get(path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual([work['id'] for work in response.json()], [work2_id, work3_id])

        response = self.client.get(path, {'only_first_period': 'true'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual([work['id'] for work in response.json()], [work2_id])

        context2 = TestContext()
        record = context2.new_record(work_title=work2.title)
        response = context2.get(path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual([work.get('record') for work in response.json()], [record, None])
