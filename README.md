# Цифровая визитка — Евгений Колесников, Fullstack-разработчик

**Посмотреть:** https://evgeny-kolesnikov.fly.dev · **GraphQL (GraphiQL):** https://evgeny-kolesnikov.fly.dev/graphql
**Исходники:** https://github.com/Ricorder/business-card · ![CI](https://github.com/Ricorder/business-card/actions/workflows/ci.yml/badge.svg)

Приложение на Fly.io в регионе `fra` с `auto_stop_machines = 'stop'`: после простоя машина
засыпает, и первый заход может подождать несколько секунд — это цена того, что демо не крутит
постоянно оплачиваемый ресурс.

Визитка презентует меня как специалиста и собрана на стеке, который требовался в задании.
Важное отличие от обычного «портфолио на статике»: **содержимое страницы не написано в
компонентах**. Всё, что вы видите — ответ GraphQL-запроса `card`, который сервер читает из
SQLite через Prisma. Текст правится в одном файле (`packages/api/src/seed/content.ts`), и
меняются одновременно и API, и страница.

---

## Быстрый старт

### Один контейнер (рекомендуемый способ)

```bash
docker compose up --build
# → визитка: http://localhost:4000/
# → GraphiQL: http://localhost:4000/graphql
# → здоровье: http://localhost:4000/healthz
```

Контейнер сам применяет миграции и сидирует базу на старте; данные лежат в именованном
volume `card-data`, то есть переживают пересборку образа.

### Локально, без Docker

```bash
pnpm install
cp .env.example packages/api/.env
pnpm --filter @card/api db:generate
pnpm --filter @card/api db:deploy
pnpm --filter @card/api db:seed
pnpm build
pnpm start          # NestJS отдаёт и GraphQL, и собранную статику
```

Для разработки в двух терминалах: `pnpm --filter @card/api dev` (:4000) и
`pnpm --filter @card/web dev` (:3000, проксирует `/graphql` на API).

### Проверки

```bash
pnpm typecheck   # 4 пакета, строгий TS
pnpm test        # 25 тестов, включая сквозной прогон GraphQL
node scripts/proofread.mjs   # вычитка русской прозы в коде и данных
```

---

## Архитектура

```
браузер ── GET / ──────────────┐
                               ▼
                    ┌───── NestJS 12 + Fastify ─────┐
                    │  static: packages/web/out     │  ← Next 16, output:'export'
                    │  POST /graphql  (Apollo 5)    │
                    │  GET  /healthz                │
                    └──────────────┬────────────────┘
                                   ▼
                        Prisma 7 + driver adapter
                                   ▼
                          SQLite (файл на volume)
```

Три пакета в монорепо (`pnpm` + `turbo`):

| Пакет                 | Что делает |
|-----------------------|------------|
| `packages/contracts`  | Общий слой контрактов: zod-схемы ответов, тексты GraphQL-операций, типы. От него зависят и сервер, и клиент. |
| `packages/api`        | NestJS на Fastify: code-first GraphQL, Prisma, сид, раздача статики. |
| `packages/web`        | Next.js со статическим экспортом, CSS-модули, данные только из GraphQL. |

Порядок слоёв во фронтенде — FSD: `app` (маршруты) → `views` → `widgets` → `features` →
`entities` → `shared`. Каждый компонент лежит в трёх файлах: `x.tsx`, `x.module.css`,
`x.types.ts`.

---

## Как закрыты требования задания

| Технология | Где именно | Как проверить |
|---|---|---|
| **Git** | История коммитов с осмысленными сообщениями, `.gitignore`, атомарные коммиты по слоям | `git log --oneline`, `git show --stat` |
| **TypeScript** | Все три пакета, `strict: true` + `noUncheckedIndexedAccess`; типы не только «для компилятора», но и граница контракта | `pnpm typecheck` |
| **Node.js** | Сервер на Node 24 в образе; ESM (`"type": "module"`), как у NestJS 12 | `docker run … node -v`, `packages/api/package.json` |
| **NestJS** | Модули, DI, резолверы, `@nestjs/platform-fastify`, shutdown hooks | `packages/api/src/**` |
| **Prisma** | Схема, миграции, сид, типизированный клиент, driver adapter для SQLite | `packages/api/prisma/`, `pnpm --filter @card/api db:deploy` |
| **GraphQL** | Code-first SDL, четыре операции, GraphiQL, сгенерированный `schema.graphql` в репо | `curl -X POST …/graphql`, открыть `/graphql` в браузере |
| **Docker** | Multi-stage образ: сборка → рантайм без dev-зависимостей, непривилегированный пользователь, healthcheck, volume | `docker build .`, `docker compose up` |
| **Claude Code** | См. раздел «Как это собиралось» ниже — честно | `QWEN.md`, история коммитов |

---

## GraphQL: что можно потрогать

Четыре операции, все публичные и только на чтение.

```graphql
{
  card {                          # витрина: 40 секунд чтения
    profile { displayName tagline }
    metrics { value label detail }
    experiences {
      company achievementsTotal   # total честный: сколько строк в базе всего
      achievements { text category }   # только featured
    }
  }
}

{ resume { projects { name stack } education { school } } }   # полное резюме

query ($q: String!) { search(query: $q, limit: 5) { total hits { kind title text } } }

{ health { status databaseConnected records } }
```

SDL лежит в репозитории как `packages/api/schema.graphql` — он генерируется самим приложением
при старте, а не пишется руками, и не может разойтись с кодом.

**Контракт проверяется с обеих сторон.** На сервере ответ проходит через zod-схему из
`@card/contracts` перед тем, как уйти в сеть; на клиенте тот же парсер проверяет ответ
прежде, чем он попадёт в React. Сквозной тест отдельно сверяет поля SDL с полями zod-схемы,
так что потерянное или лишнее поле ловится до выкатки.

---

## Модель данных

`Profile` 1∞ `ContactLink`, плюс `Experience` 1∞ `Achievement`, `Project` 1∞ `StackItem`,
`SkillGroup` 1∞ `Skill`, `Metric`, `LanguageSkill`, `Education`.

Несколько осознанных решений:

- **`featured` вместо `slice(0, 4)` в резолвере.** Отбор витрины — данные, а не код.
  Поэтому `card` и `resume` читают одни и те же таблицы, и `achievementsTotal` всегда
  соответствует действительности.
- **`visibility` у контактов.** Телефон на публичную страницу не выносится (решение
  владельца): номер появляется в базе только если его явно передать окружением
  `CARD_PHONE_URL`, и всегда с `visibility=private`, который не отдаёт ни `card`, ни
  `resume`, ни `search`. Это проверено тестом, который заводит приватный контакт и
  убеждается, что наружу он не просочился.
- **Стек проекта — отдельная таблица**, а не строка через запятую: SQLite не умеет массивы,
  и городить CSV в API было бы обманом модели.
- **Enum'ы в нижнем регистре** (`backend`, `telegram`), вопреки конвенции SCREAMING_SNAKE.
  GraphQL печатает имя члена enum как значение на проводе; с верхним регистром появилось бы
  два словаря — «backend» в базе и «BACKEND» в API — с переводом на обеих границах.
  Спецификация GraphQL этого не требует, а одно имя в трёх местах дороже косметики в SDL.

## Почему поиск в приложении, а не `LIKE` в базе

SQLite регистронезависим только для латиницы: `contains` по-русски молча промахивается,
а содержимое визитки по-русски. Строк в базе десятки, поэтому поиск читает выборку целиком и
сравнивает через `toLocaleLowerCase('ru')` — дёшево и предсказуемо. Это зафиксировано тестом
(«находит по русскому тексту независимо от регистра»).

---

## Развёртывание

`fly.toml` поднимает один машин из этого же Dockerfile, монтирует volume `card_data` в
`/data` (иначе SQLite обнулится при первом же редеплое) и снимает пробы через `/healthz`.

```bash
fly deploy
```

---

## Как это собиралось

Проект написан с помощью CLI-агента **Qwen Code** (Alibaba), а не Claude Code. Контекст
проекта, команды и накопленные при сборке грабли лежат в `QWEN.md` — это аналог `CLAUDE.md`,
и я не стал выдавать один инструмент за другой: репозиторий в задании просят смотреть
именно как историю работы, и приписывать себе чужой агент было бы дешевле объяснить на
созвоне, чем потом объяснять найденное.

Что реально видно по репозиторию: план работ, итерации с исправлениями падений (ESM-переход
NestJS 12, конфликт not-found обработчика с Fastify, формат enum'ов), тесты, которые сначала
падали и были починены по существу, а не заглушены.

## Структура

```
packages/
  contracts/   zod-схемы, GraphQL-документы, парсеры
  api/         NestJS + Prisma + GraphQL + раздача статики
  web/         Next.js static export, FSD, CSS-модули
docker/        entrypoint.sh
scripts/       proofread.mjs
.github/       ci.yml
```

## Что бы я доделал, если бы время не было ограничено

- ISR/пре-рендер ответов `card` в HTML, чтобы первый экран не зависел от JavaScript.
- `@fieldMetadata`-директивы для пагинации в `search` и лимиты на сложность запроса.
- E2E на Playwright против собранного образа (сейчас браузерные проверки я прогонял вручную).
