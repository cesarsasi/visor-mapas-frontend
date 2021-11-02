FROM node:10.19 AS build-stage
WORKDIR /app
COPY package.json ./
RUN node -v
RUN npm -v
RUN npm i
COPY . .
RUN npm run build

# etapa de producción
FROM nginx:1.13.12-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]