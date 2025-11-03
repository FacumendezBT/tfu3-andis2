FROM node:20 AS build

WORKDIR /usr/src/app

COPY gateway/package.json gateway/package-lock.json ./
COPY gateway/tsconfig.json ./
RUN npm ci

COPY gateway/. ./
RUN npm run build

FROM node:20-slim AS production

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY gateway/package.json gateway/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.js"]

