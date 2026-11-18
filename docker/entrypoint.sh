#!/bin/sh
# Старт контейнера: схема -> содержимое -> приложение.
#
# Миграции применяются на каждом старте, потому что база лежит на volume и
# переживает пересборку образа: без этого шага новый образ с изменённой схемой
# упал бы на первой же запросе к несуществующей колонке.
#
# Сид идемпотентен (см. src/seed/seed.ts): он приводит базу к содержимому
# src/seed/content.ts, а не дописывает строки поверх.
set -eu

if [ ! -d /data ]; then
  echo "entrypoint: нет каталога /data — volume не примонтирован?" >&2
  exit 1
fi

echo "entrypoint: DATABASE_URL=$DATABASE_URL"
npx prisma migrate deploy
node dist/seed/seed.js

echo "entrypoint: запуск $*"
exec "$@"
