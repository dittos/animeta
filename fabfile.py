from fabric.api import *

env.hosts = ['animeta.net']

def deploy():
    _deploy(newapi=True, frontend=True)

def deploy_api():
    _deploy(api=True)

def deploy_newapi():
    _deploy(newapi=True)

def deploy_frontend():
    _deploy(frontend=True)

def _deploy(api=False, newapi=False, frontend=False):
    # local builds
    if newapi:
        with lcd('backend'):
            local('./gradlew build')
    if frontend:
        local('rm -f animeta/static/build/*')
        local('npm run build-assets')  # -> animeta/static/build/*, frontend/assets.json
        local('npm run build-server')  # -> frontend-server/bundle.js

        local('rm -rf frontend-dist')
        local('npm run build-dist')  # -> frontend-dist/*
        local('cp frontend-server/*.ejs frontend-server/bundle.js frontend-dist/')

    local('git push')
    with cd('/home/ditto/animeta'):
        # update
        run('rm -f package-lock.json')  # Avoid conflict
        run('git pull')
        if frontend:
            run('npm install')
        if api:
            with cd('backend-legacy'):
                run('../venv/bin/pip install -r ./requirements.txt')
                run('../venv/bin/python manage.py migrate')
        if newapi:
            put('backend/build/libs/backend-1.0.0.war', 'backend.war.tmp')
        if frontend:
            run('mkdir -p animeta/static/build')
            put('animeta/static/build/*', 'animeta/static/build/')
            run('rm -rf frontend-dist')
            run('mkdir frontend-dist')
            put('frontend-dist/*', 'frontend-dist/')
            put('frontend/assets.json', 'frontend-dist/')
            run('cp frontend-server/config.json frontend-dist/')

        # reload
        if newapi:
            run('mv backend.war.tmp backend-1.0.0.war')
        if frontend:
            run('pm2 gracefulReload animeta')
