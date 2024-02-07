FROM node:20.9.0 as node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build-only

FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html

COPY --from=node /usr/src/app/dist/ .

COPY ./public/env.sh .
COPY .env .


# Add bash
RUN apk add --no-cache bash

# Make our shell script executable
RUN chmod +x env.sh


# Start Nginx server
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
#CMD ["nginx", "-g", "daemon off;"]
