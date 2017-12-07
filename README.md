# 애니메타

https://animeta.net/

크게 백엔드 API 서버 (Kotlin, Spring Boot)와 프론트엔드 서버 (Node.js, Express) 및 프론트엔드 (React)로 구성되어 있습니다.


## DB 초기화

`backend-legacy` 디렉토리에서 작업합니다.

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


## 백엔드 서버

`backend` 디렉토리에서 작업합니다.

### 설정

`application.properties.sample`을 가지고 `application.properties`를 작성합니다.

### 개발 서버 실행

    ./gradlew bootRun


## 프론트엔드 / 프론트엔드 서버

### 의존성 설치

    npm install
    git submodule init
    ./build-external.sh

### 설정

    cp frontend/config.json.sample frontend/config.json

### 개발 서버 시작

    npm start
