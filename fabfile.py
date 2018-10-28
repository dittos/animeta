from fabric.api import *

env.hosts = ['animeta.net']

def deploy_backend():
    with lcd('backend'):
        local('./gradlew dockerPush')
    docker()

def docker():
    with cd('/home/ditto/animeta'):
        run('git pull')

    with cd('/home/ditto/docker/animeta'):
        sudo('docker stack deploy -c docker-compose.yml animeta')
