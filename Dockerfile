FROM node:24.16.0 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.25

RUN mkdir /app
COPY --from=builder /app/dist /app/
