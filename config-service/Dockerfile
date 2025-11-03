FROM node:20 AS build

WORKDIR /usr/src/app

COPY config-service/package.json config-service/package-lock.json ./
COPY config-service/tsconfig.json ./
RUN npm ci

COPY config-service/. ./
RUN npm run build

FROM node:20-slim AS production

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY config-service/package.json config-service/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]

