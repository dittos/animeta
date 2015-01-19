from fabric.api import *

def deploy():
    with cd('/home/ditto/animeta'):
        run('git pull') # To get password prompt first
        local('rm -f animeta/static/build/*')
        local('git checkout animeta/static/build/common.css')
        local('NODE_ENV=production ./node_modules/.bin/webpack')
        run('npm install')
        run('env/bin/pip install -r ./requirements.txt')
        run('env/bin/python manage.py migrate')
        put('animeta/static/build/*', 'animeta/static/build/')
        put('animeta/assets.py', 'animeta/')
        sudo('reload animeta')
