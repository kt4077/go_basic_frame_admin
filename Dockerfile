# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS builder

WORKDIR /src
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
ARG VITE_ADMIN_API_BASE_URL=/
ARG VITE_ADMIN_API_TIMEOUT_MS=30000
ENV VITE_ADMIN_API_BASE_URL=${VITE_ADMIN_API_BASE_URL} \
    VITE_ADMIN_API_TIMEOUT_MS=${VITE_ADMIN_API_TIMEOUT_MS}
RUN pnpm build

FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /src/dist /usr/share/nginx/html
EXPOSE 8080
