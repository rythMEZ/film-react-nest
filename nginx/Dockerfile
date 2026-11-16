# syntax=docker/dockerfile:1

FROM nginx:1.27-alpine AS production

COPY default.conf /etc/nginx/conf.d/default.conf

VOLUME ["/usr/share/nginx/html"]

EXPOSE 80
