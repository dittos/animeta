# 애니메타

https://animeta.net/

크게 백엔드 API 서버 (Kotlin, Spring Boot)와 프론트엔드 서버 (Node.js, Express) 및 프론트엔드 (React)로 구성되어 있습니다.


## 백엔드 서버

`backend` 디렉토리에서 작업합니다.

### DB 초기화

PostgreSQL DB에 `schema.sql`을 반영합니다.

### 설정

`application.properties.sample`을 가지고 `application.properties`를 작성합니다.

### 개발 서버 실행

    ./gradlew bootRun --args=--spring.config.location=../application.properties


## 프론트엔드 / 프론트엔드 서버

`web` 디렉토리에서 작업합니다.

### 의존성 설치

    npm install

### 설정

`frontend-server/config.json.sample`을 가지고 `frontend-server/config.json`을 작성합니다.

### 개발 서버 실행

    npm start
