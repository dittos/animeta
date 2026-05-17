FROM node:22 AS builder

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

RUN mkdir /app
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/

COPY shared/package.json /app/shared/
COPY frontend-server/package.json /app/frontend-server/
COPY frontend/package.json /app/frontend/

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm -C frontend-server run build:bundle
RUN pnpm -C frontend run build-assets
RUN pnpm -C frontend run build-server


FROM node:22-slim

RUN mkdir /app
WORKDIR /app

COPY --from=builder /app/shared /app/shared
COPY --from=builder /app/frontend-server/dist /app/frontend-server/dist
COPY --from=builder /app/frontend/dist /app/frontend/dist

ENV NODE_ENV production
ENV ANIMETA_FRONTEND_DIST_PATH /app/frontend/dist

CMD ["node", "frontend-server/dist/bundle.js"]
