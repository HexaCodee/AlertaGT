FROM node:22-bookworm AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

COPY client-admin/package.json client-admin/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY client-admin/. .
RUN pnpm build

ENV NODE_ENV=production

EXPOSE 5173

CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "5173"]
