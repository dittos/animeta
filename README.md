# 애니메타

http://animeta.net/

크게 백엔드 API 서버 (Django)와 프론트엔드 서버 (Node.js, Express) 및 프론트엔드 (React)로 구성되어 있습니다.

## 백엔드 API 서버

### 필요한 것들

* Python 2.7.x
* pip

### 의존성 설치

    virtualenv env
    . env/bin/activate
    pip install -r ./requirements.txt

### 설정

    cp animeta/settings.py.example animeta/settings.py
    python manage.py syncdb

### 개발 서버 실행

    python manage.py runserver

## 프론트엔드 / 프론트엔드 서버

* Node.js
* NPM
* Webpack (`npm install -g webpack`)

### 의존성 설치

    npm install -g webpack
    npm install .

### 설정

    cp frontend/config.json.sample frontend/config.json

### 개발 서버 시작

    npm run start-assets & # asset build
    npm run start # frontend server
