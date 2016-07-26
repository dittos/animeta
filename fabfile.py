from fabric.api import *

def deploy():
    _deploy(api=True, frontend=True)

def deploy_api():
    _deploy(api=True)

def deploy_frontend():
    _deploy(frontend=True)

def deploy_frontend_server():
    _deploy(frontend_server=True)

def deploy_servers():
    _deploy(api=True, frontend_server=True)

def _deploy(api=False, frontend=False, frontend_server=False):
    if frontend:
        frontend_server = True

    local('git push')
    with cd('/home/ditto/animeta'):
        run('git pull') # To get password prompt first
        if frontend:
            local('rm -f animeta/static/build/*')
            local('NODE_ENV=production ./node_modules/.bin/webpack')
        if frontend_server:
            run('./build-external.sh')
            run('npm install')
        if api:
            run('env/bin/pip install -r ./requirements.txt')
            run('env/bin/python manage.py migrate')
        if frontend:
            put('animeta/static/build/*', 'animeta/static/build/')
            put('frontend/assets.json', 'frontend/')
        if frontend_server:
            run('rm -rf frontend-dist')
            run('./node_modules/.bin/babel frontend --ignore external/** -d frontend-dist --copy-files')
        if api:
            run('touch ~/uwsgi-services/animeta.ini')
        if frontend_server:
            run('pm2 gracefulReload animeta')
