FROM node:22-bookworm AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

COPY posts-service/package.json posts-service/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY posts-service/. .

ENV NODE_ENV=production

EXPOSE 3020

CMD ["pnpm", "start"]
