FROM node:18-alpine

RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD [ "node", "server.js" ]