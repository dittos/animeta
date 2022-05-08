FROM node:16

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci && npm cache clean --force

COPY shared /app/shared
COPY frontend-server /app/frontend-server
RUN npm run build-dist
RUN cp frontend-server/*.ejs frontend-dist/

COPY static /app/static

COPY frontend /app/frontend
RUN npm run build-assets
RUN npm run build-server
RUN cp frontend/assets.json frontend-server/bundle.js frontend-server/bundle.js.map frontend-dist/

ENV NODE_ENV production

CMD ["node", "frontend-dist/frontendServer.js"]
