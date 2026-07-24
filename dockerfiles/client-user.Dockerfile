FROM node:22-bookworm AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

COPY client-user/package.json client-user/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY client-user/. .

ENV NODE_ENV=development

EXPOSE 8081 19000 19001 19002

CMD ["pnpm", "start", "--host", "lan", "--non-interactive"]
