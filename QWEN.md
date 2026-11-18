# Контекст проекта для агентов

Цифровая визитка на NestJS + GraphQL + Prisma (SQLite), фронт — Next.js со статическим
экспортом, всё в одном Docker-образе. Монорепо: pnpm workspaces + turbo.

## Команды

| Задача | Команда (из корня) |
|---|---|
| Установка | `pnpm install` |
| Сборка всего | `pnpm build` |
| Типы | `pnpm typecheck` |
| Тесты | `pnpm test` |
| API + статика на :4000 | `pnpm build && pnpm start` |
| Дев в двух процессах | `pnpm --filter @card/api dev` и `pnpm --filter @card/web dev` |
| Миграции и сид (локально) | `pnpm db:setup` |
| Новая миграция | `pnpm --filter @card/api db:migrate -- --name <имя>` |
| Docker | `docker compose up --build` |
| Вычитка прозы | `node scripts/proofread.mjs` |

Порядок зависимостей в сборке важен: `contracts` → `api` (нужен сгенерированный клиент) →
`web`. Turbo это покрыл через `dependsOn: ["^build"]`, но `prisma generate` отдельный шаг:
он не является частью `nest build`.

## Уклад

- CSS только модулями (`*.module.css`), без Tailwind и UI-библиотек. Темы — CSS-переменными
  в `:root` и `:root[data-theme='dark']`.
- Каждый компонент — три файла: `x.tsx`, `x.module.css`, `x.types.ts`. Типы не инлайном.
- Слои во фронтенде: `app` → `views` → `widgets` → `features` → `entities` → `shared`,
  импорты через алиас `@/…`.
- Русские комментарии и тексты. Термин в русском слове разделяется дефисом (`CSS-модули`),
  склейка кириллицы с латиницей — ошибка, её ловит `scripts/proofread.mjs`.

## Грабли, на которых это уже ломалось

**NestJS 12 поставляется только в ESM** (`"type": "module"`, CJS-варианта в пакете нет).
Пакет `api` обязан быть ESM: `"type": "module"`, `module: NodeNext`. Если собрать его в CJS,
Node 24+ ещё сможет `require(esm)`, но jest-песочница упадёт с «Must use import to load ES
Module», а поведение зависит от версии Node в образе.

**Prisma 7 не читает `url` из `schema.prisma`** — он переехал в `prisma.config.ts`, а клиент
получает соединение driver-адаптером (`PrismaBetterSqlite3`). Относительный путь SQLite
разрешается от рабочего каталога CLI, поэтому в `.env` это `file:../../var/card.db`, а в
контейнере — абсолютный `file:/data/card.db`.

**Генератор клиента настраивается так**: `provider = "prisma-client"`, `moduleFormat = "esm"`,
`importFileExtension = "js"`. С дефолтными настройками он выдаёт `.ts`-спецификаторы, и
NodeNext их не принимает; с `moduleFormat = "cjs"` — `import.meta.url`, что не компилируется
в CommonJS.

**pnpm 12 не выполняет install-скрипты зависимостей молча.** Без блока `allowBuilds` в
`pnpm-workspace.yaml` better-sqlite3 не компилируется, а `@prisma/engines` не скачивает
schema-engine, и сборка падает врантьём про несуществующий бинарник. Ключ
`onlyBuiltDependencies` этой версии уже не управляет — только `allowBuilds`.

**`process.loadEnvFile()` не перекрывает переменные, уже заданные в окружении.** Поэтому
`prisma.config.ts` может читать `.env`, а тесты — подставлять свою `DATABASE_URL` через env,
конфликта не будет.

**Свой `setNotFoundHandler` в Fastify ломает старт**: Nest вешает собственный на этапе
`init()`, и вторая попытка даёт «Not found handler already set». Раздача статики держится на
`@fastify/static` с маршрутом `/*` (это `wildcard` по умолчанию); точные маршруты `/graphql`
и `/healthz` остаются приоритетнее. С `wildcard: false` ассеты `/_next/*` перестают
отдаваться.

**GraphQL enum печатает имя члена TS-enum, а не его значение.** Ключи в верхнем регистре
уходят на провод как `BACKEND` и расходятся со строками SQLite и zod-union'ами.

**Jest в ESM**: `NODE_OPTIONS=--experimental-vm-modules`, `extensionsToTreatAsEsm`,
`moduleNameMapper` для `./x.js` → `./x.ts`, и глобального `jest` нет — нужен
`import { jest } from '@jest/globals'`. `testRegex` обязан ловить и `*.e2e-spec.ts`: со
строгим `\\.spec\\.ts$` сквозная сюита молча не запускалась.

**`@nestjs/apollo` на Fastify требует `@as-integrations/fastify`** — это peer, а не
зависимость; без него PackageLoader падает при старте.

**Next 16 + `output: 'export'`**: `rewrites` из конфига в статической сборке игнорируются,
поэтому прокси `/graphql` объявляется только в dev-ветке конфига.

**Правило `static` без слэша в .gitignore матчит не только сборочный выход.** Оно
проглотило `packages/api/src/static/` — исходник, которого поэтому не было в репозитории.
Локально сборка оставалась зелёной (файл на диске есть), падал только CI. Выходные каталоги
перечислены явно (`packages/web/out`, `packages/api/dist`, `packages/contracts/dist`), а
`git check-ignore -v <файл>` — способ проверить правило, не гадая.

**`prisma generate` обязан быть частью `build`, а не отдельным скриптом.** Пока он жил в
`db:generate`, CI вызывал `nest build` без генерации и получал 69 ошибок TS в сиде; локально
ошибка не воспроизводилась, потому что клиент уже лежал в `src/generated`.

## Что проверяется тестами, а не на глаз

- `card` фильтрует featured и публичные контакты на уровне запроса к базе, а не постфактум.
- приватный контакт, заведённый прямо в таблице, не появляется ни в одном публичном ответе;
- `resume` отдаёт строго больше фактов, чем `card`, и `achievementsTotal` ему равен;
- SDL и zod-контракт имеют одинаковый набор полей (иначе тест падает);
- содержимое `src/seed/content.ts` проходит инварианты: не больше 4 буллетов на место,
  уникальные slug'и, нет телефона, в каждой группе навыков есть витринный.

## Чего здесь намеренно нет

- Мутаций GraphQL: визитка читается, пишется она из `src/seed/content.ts`.
- CORS-ограничений: данные публичные, открытый CORS позволяет собрать свою вкладку поверх API.
- Кэширующего GraphQL-клиента во фронтенде: десятки строк не стоят библиотеки.
