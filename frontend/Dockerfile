
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api/afisha
ARG VITE_CDN_URL=/content/afisha

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_CDN_URL=${VITE_CDN_URL}

RUN npm run build

FROM alpine:3.20 AS artifacts

WORKDIR /app

COPY --from=builder /app/dist ./source

VOLUME ["/output"]

CMD ["sh", "-c", "cp -a /app/source/. /output/"]

FROM nginx:1.27-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

VOLUME ["/usr/share/nginx/html"]

EXPOSE 80
