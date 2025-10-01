FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# ВАЖНО: подменяем дефолтный конфиг на наш
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80