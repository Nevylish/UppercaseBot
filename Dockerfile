FROM node:latest

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production && npm cache clean --force && npm install -g typescript

COPY ./src ./src
COPY ./tsconfig.json ./

RUN npx tsc

CMD cd dist && node index.js