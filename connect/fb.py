name = 'Facebook'

try:
    import facebook
    available = True
except:
    available = False

from models import FacebookSetting

def get_setting(user):
    try:
        return FacebookSetting.objects.get(user=user)
    except FacebookSetting.DoesNotExist:
        return None

def get_api(setting):
    return facebook.GraphAPI(setting.key)

def post_history(setting, title, status, url, comment):
    api = get_api(setting)
    try:
        data = {
            'link': url,
            'name': (u'%s %s' % (title, status)).encode('utf-8'),
            'description': comment.encode('utf-8'),
        }
        api.put_wall_post('', data)
        return True
    except Exception, e:
        raise e
        return False
