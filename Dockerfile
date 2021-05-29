FROM node:12.18-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install pm2 -g
RUN npm cache verify
RUN npm install --silent && mv node_modules ../
COPY . .
EXPOSE 3000
CMD ["npm", "run dev"]
