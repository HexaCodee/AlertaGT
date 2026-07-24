FROM node:22-bookworm AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

COPY geolocatedalerts-service/package.json geolocatedalerts-service/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY geolocatedalerts-service/. .

ENV NODE_ENV=production

EXPOSE 3022

CMD ["pnpm", "start"]
