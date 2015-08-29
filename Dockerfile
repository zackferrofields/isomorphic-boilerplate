FROM ubuntu:14.04

RUN apt-get update -y -q
RUN apt-get upgrade -y -q
RUN apt-get install -y -q nodejs npm build-essential
RUN ln -s "$(which nodejs)" /usr/bin/node

COPY . /app
WORKDIR /app
RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]
