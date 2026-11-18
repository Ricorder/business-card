# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Визитка живёт в одном образе: NestJS раздаёт GraphQL и статический экспорт
# Next.js с одного порта. Отдельного фронт-контейнера нет намеренно.
# ---------------------------------------------------------------------------

FROM node:24-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# --- слой зависимостей: только манифесты, чтобы install не сбрасывался сменой кода
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/
RUN pnpm install --frozen-lockfile

# --- сборка всех трёх пакетов
FROM base AS build
COPY --from=deps /app /app
COPY . .
RUN pnpm --filter @card/contracts build \
  && pnpm --filter @card/api db:generate \
  && pnpm --filter @card/api build \
  && pnpm --filter @card/web build

# --- рантайм: прод-зависимости и артефакты, без исходников и devDependencies
FROM base AS runner
ENV NODE_ENV=production \
    PORT=4000 \
    HOST=0.0.0.0 \
    DATABASE_URL=file:/data/card.db \
    STATIC_DIR=/app/packages/web/out \
    GRAPHIQL=true

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

# better-sqlite3 пересобирается под Linux здесь, а не копируется из builder-слоя:
# pnpm хранит node_modules симлинками на .pnpm-хранилище, и копирование
# сломало бы эту раскладку.
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=build /app/packages/api/dist ./packages/api/dist
COPY --from=build /app/packages/api/prisma ./packages/api/prisma
COPY --from=build /app/packages/api/prisma.config.ts ./packages/api/prisma.config.ts
COPY --from=build /app/packages/web/out ./packages/web/out
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN mkdir -p /data && chown -R node:node /data /app
USER node

EXPOSE 4000
VOLUME /data

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/healthz').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

WORKDIR /app/packages/api
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "dist/main.js"]
