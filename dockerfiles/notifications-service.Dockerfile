FROM node:22-bookworm AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

COPY notifications-service/package.json notifications-service/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY notifications-service/. .

ENV NODE_ENV=production

EXPOSE 3021

CMD ["pnpm", "start"]
