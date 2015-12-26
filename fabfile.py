from fabric.api import *

def deploy():
    local('git push')
    with cd('/home/ditto/animeta'):
        run('git pull') # To get password prompt first
        local('rm -f animeta/static/build/*')
        local('NODE_ENV=production ./node_modules/.bin/webpack')
        run('npm install')
        run('env/bin/pip install -r ./requirements.txt')
        run('env/bin/python manage.py migrate')
        put('animeta/static/build/*', 'animeta/static/build/')
        put('frontend/assets.json', 'frontend/')
        run('touch ~/uwsgi-services/animeta.ini')
        run('pm2 gracefulReload animeta')

def deploy_api():
    local('git push')
    with cd('/home/ditto/animeta'):
        run('git pull') # To get password prompt first
        run('env/bin/pip install -r ./requirements.txt')
        run('env/bin/python manage.py migrate')
        run('touch ~/uwsgi-services/animeta.ini')
