# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable pnpm

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/*/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY packages ./packages
RUN pnpm -r build

# Production
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/packages/server/dist ./dist
COPY --from=build /app/packages/server/package.json ./package.json
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000
CMD ["node", "dist/cli.js", "--host", "0.0.0.0", "--port", "3000"]
