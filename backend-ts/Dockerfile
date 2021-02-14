FROM node:10

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN node_modules/.bin/nest build

ENTRYPOINT ["node", "dist/main.js"]
