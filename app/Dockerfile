FROM node:20 AS build

WORKDIR /usr/src/app

COPY app/package*.json ./
COPY app/tsconfig.json ./
RUN npm ci

COPY app/. ./
RUN npm run build

FROM node:20-slim AS production

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
