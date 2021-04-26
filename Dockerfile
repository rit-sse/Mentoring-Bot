FROM node:14-alpine

RUN apk add tzdata && \
    cp /usr/share/zoneinfo/America/New_York /etc/localtime && \
    echo "America/New_York" > /etc/timezone && \
    apk del tzdata

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

ENTRYPOINT ["npm", "start"]
