# backend-e2e

Black-box contract tests for the Animeta backend.

The tests require an already running backend server. The test runner does not import
or start backend implementation code.

Required environment:

- `ANIMETA_BASE_URL`, for example `http://localhost:3000`
- `ANIMETA_TEST_TOKEN`, matching the server's test API token

The target server must expose:

- `GET /health`
- `POST /graphql`
- test fixture routes under `/__test`, enabled separately by the server

Run:

```sh
pnpm -C backend-e2e test
```
