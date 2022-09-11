# 애니메타

https://animeta.net/

크게 백엔드 API 서버 (Node.js)와 프론트엔드 서버 (Node.js, Express) 및 프론트엔드 (React)로 구성되어 있습니다.


## 백엔드 서버

`backend-ts` 디렉토리에서 작업합니다.

### DB 초기화

PostgreSQL DB에 `schema.sql`을 반영합니다.

### 설정

`.env.sample`, `ormconfig.json.sample`을 가지고 `.env`, `ormconfig.json`를 작성합니다.

### 개발 서버 실행

    npm run start:dev


## 프론트엔드 / 프론트엔드 서버

`web` 디렉토리에서 작업합니다.

### 의존성 설치

[pnpm](https://pnpm.io/)이 필요합니다.

    pnpm install

### 원격 백엔드를 사용하는 경우

프론트엔드만 수정하고 싶을 때 사용할 수 있는 방법입니다. **(주의: 프로덕션 서비스 백엔드를 그대로 사용하게 됩니다.)**

    pnpm -C frontend run start-remote

### 로컬 백엔드를 사용하는 경우

1. `frontend/config.json.sample`을 가지고 `frontend/config.json`을 작성합니다.
2. 개발 서버 실행: `cd frontend; pnpm start`
