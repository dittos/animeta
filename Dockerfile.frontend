FROM node:8

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci

COPY frontend-server /app/frontend-server
RUN npm run build-dist
RUN cp frontend-server/*.ejs frontend-dist/

COPY animeta /app/animeta

COPY frontend /app/frontend
RUN npm run build-assets
RUN npm run build-server
RUN cp frontend/assets.json frontend-server/bundle.js frontend-server/bundle.js.map frontend-dist/

ENV NODE_ENV production

COPY ./docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "frontend-dist/frontendServer.js"]
