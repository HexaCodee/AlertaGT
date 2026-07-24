FROM node:22-bookworm AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

COPY reputation-service/package.json reputation-service/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY reputation-service/. .

ENV NODE_ENV=production

EXPOSE 3023

CMD ["pnpm", "start"]
