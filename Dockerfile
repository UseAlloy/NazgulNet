FROM node:8

ADD . /app/src/

WORKDIR /app/src

RUN npm install

CMD ['/usr/local/bin/npm','start']