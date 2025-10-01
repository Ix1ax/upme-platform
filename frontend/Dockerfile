# ----- build (vite) -----
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ----- run (nginx) -----
FROM nginx:1.27-alpine
# Кладём собранную статику в стандартную директорию nginx
COPY --from=build /dist /usr/share/nginx/html
EXPOSE 80