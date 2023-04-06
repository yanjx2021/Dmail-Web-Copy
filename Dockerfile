# Stage 0: build
FROM node:18 AS build

ENV FRONTEND=/opt/frontend

WORKDIR $FRONTEND

RUN npm config set registry https://registry.npm.taobao.org/

COPY . .

RUN npm install

RUN npm run build

# Stage 1
FROM nginx:1.22

ENV HOME=/opt/app

WORKDIR $HOME

COPY --from=build /opt/frontend/dist dist

COPY nginx /etc/nginx/conf.d

EXPOSE 80