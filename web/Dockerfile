FROM node:16 AS builder

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

RUN mkdir /app
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/

COPY shared/package.json /app/shared/
COPY frontend-server/package.json /app/frontend-server/
COPY frontend/package.json /app/frontend/

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm -C frontend run build-assets
RUN pnpm -C frontend run build-server
RUN pnpm -C frontend-server run build


FROM node:16

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

RUN mkdir /app
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/

COPY shared/package.json /app/shared/
COPY frontend-server/package.json /app/frontend-server/
COPY frontend/package.json /app/frontend/

RUN pnpm -C frontend-server install --frozen-lockfile --prod

COPY --from=builder /app/static /app/static
COPY --from=builder /app/shared /app/shared
COPY --from=builder /app/frontend-server /app/frontend-server
COPY --from=builder /app/frontend/assets.json /app/
COPY --from=builder /app/frontend/bundle.server.js /app/

ENV NODE_ENV production
ENV ANIMETA_ASSETS_PATH /app/assets.json
ENV ANIMETA_BUNDLE_PATH /app/bundle.server.js

CMD ["node", "frontend-server/dist/frontendServer.js"]
