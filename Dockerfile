FROM node:24-bookworm AS node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

RUN npm run build-only

FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html

COPY --from=node /usr/src/app/dist/ .

COPY ./public/env.sh .
COPY .env .

RUN apk add --no-cache bash

RUN chmod +x env.sh

CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
