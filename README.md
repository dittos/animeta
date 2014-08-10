# 애니메타

http://animeta.net/

## 필요한 것들

* Python 2.7.x
* pip
* Node.js
* NPM
* Webpack (`npm install -g webpack`)

## 의존성 설치

    cd animeta
    virtualenv env
    . env/bin/activate
    pip install -r ./requirements.txt
    npm install

## 설정

    cp animeta/settings.py.example animeta/settings.py
    python manage.py syncdb

## 개발 서버 시작

    webpack --watch -p & # asset build
    python manage.py runserver
