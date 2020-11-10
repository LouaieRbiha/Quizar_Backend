FROM node:15.1.0-alpine3.10
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm cache verify
RUN npm install
COPY . /usr/src/app
EXPOSE 3000
CMD ["npm","start"]