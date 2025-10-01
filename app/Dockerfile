FROM node:24

WORKDIR /usr/src/app

COPY app/package*.json ./
RUN npm install --production

COPY . .
RUN tsc

EXPOSE 5000
CMD ["node", "app/src/app.js"]
