import type { AchievementCategory, ContactKind, LanguageLevel } from '@card/contracts'

/**
 * Единственный текст, из которого сидируется база. Правки содержания — здесь,
 * а не в резолвере и не в компонентах: и GraphQL, и страница читают SQLite.
 *
 * `featured` означает «видно на витрине». Полное резюме отдаёт все буллеты,
 * поэтому на странице рекрутер видит четыре строки на место работы, а запросом
 * `resume` — все двенадцать, из той же базы.
 */

export interface AchievementSeed {
  text: string
  category: AchievementCategory
  featured?: boolean
}

export interface ExperienceSeed {
  slug: string
  company: string
  companyNote?: string
  role: string
  period: string
  dateStart?: string
  dateEnd?: string
  isCurrent?: boolean
  location?: string
  summary: string
  achievements: AchievementSeed[]
}

export interface ProjectSeed {
  slug: string
  name: string
  summary: string
  year?: string
  url?: string
  stack: string[]
}

export interface SkillSeed {
  name: string
  note?: string
  featured?: boolean
}

export interface SkillGroupSeed {
  slug: string
  name: string
  skills: SkillSeed[]
}

export interface ContactSeed {
  kind: ContactKind
  label: string
  url: string
  /** private не отдаётся публичному API ни в card, ни в resume. */
  visibility?: 'public' | 'private'
}

export interface CardContent {
  profile: {
    handle: string
    displayName: string
    title: string
    tagline: string
    location: string
    summary: string
    timezone: string
  }
  metrics: Array<{ value: string; label: string; detail?: string }>
  experiences: ExperienceSeed[]
  projects: ProjectSeed[]
  skillGroups: SkillGroupSeed[]
  languages: Array<{ name: string; level: LanguageLevel }>
  education: Array<{ school: string; year: string; degree: string; note?: string }>
  contacts: ContactSeed[]
}

export const content: CardContent = {
  profile: {
    handle: 'evgeny-kolesnikov',
    displayName: 'Евгений Колесников',
    title: 'Fullstack-разработчик',
    tagline: 'Пять лет восемь месяцев боевой разработки: от складского сканера штрих-кодов до платформы учёта времени на полторы тысячи сотрудников',
    location: 'Москва',
    summary:
      'Работаю end-to-end на TypeScript: Next.js и React на фронте, NestJS с PostgreSQL на бэкенде, React Native и Expo в мобильном приложении. ' +
      'Люблю измерять то, что делаю: в последнем проекте бэкенд сошёлся в один сервис из 50 доменных модулей, автесты выросли с нуля до четырёх тысяч, ' +
      'а слой маршрутов в панели стал тоньше в двадцать раз. Приходил в кодовые базы, где не было ни типов, ни тестов, и поднимал гейт качества до состояния, ' +
      'которое не стыдно показать на ревью. Держу единый уклад во всех проектах: CSS-модули вместо CSS-фреймворков, архитектура по слоям с проверкой направления импортов.',
    timezone: 'Europe/Moscow',
  },
  metrics: [
    {
      value: '5 лет 8 мес',
      label: 'коммерческого опыта',
      detail: 'Четыре компании: склад, корпоративные системы, финтех, строительная платформа',
    },
    {
      value: '4000+',
      label: 'тестов поднято с нуля',
      detail: '410 spec-файлов в CI; до этого автотестов в проекте не было вовсе',
    },
    {
      value: 'в 20 раз',
      label: 'тоньше слой маршрутов',
      detail: '66 290 → 3 270 строк после внедрения FSD в админ-панель; 95% логики ушло из файлов страниц',
    },
  ],
  experiences: [
    {
      slug: 'construction-platform',
      company: 'Строительная компания',
      companyNote: 'NDA — название не публикую',
      role: 'Fullstack-разработчик',
      period: 'Май 2026 — настоящее время',
      dateStart: '2026-05',
      isCurrent: true,
      location: 'Москва',
      summary:
        'Платформа учёта рабочего времени, кадров и дисциплины на строительных объектах: админ-панель, бэкенд и мобильное приложение рабочих и бригадиров. ' +
        'Около 1500 сотрудников на объектах, боевая эксплуатация.',
      achievements: [
        {
          category: 'backend',
          featured: true,
          text: 'Свёл бэкенд на Express и серверные функции панели в один сервис на NestJS + Fastify + Drizzle: 50 доменных модулей, 497 REST-ручек и зеркальный слой tRPC на 487 процедур. Старый контракт сохранён — мобильное приложение и панель продолжили работать без изменений.',
        },
        {
          category: 'quality',
          featured: true,
          text: 'Поднял автотесты с нуля: 0 → 410 spec-файлов и больше 4000 тестов, прогон в CI. Вместе с гейтом качества ошибки типов сократились с 247 до нуля, флаг игнорирования ошибок сборки убран.',
        },
        {
          category: 'frontend',
          featured: true,
          text: 'Внедрил архитектуру FSD: пять слоёв с автоматической проверкой направления импортов в CI. Слой маршрутов 66 290 → 3 270 строк, 95% логики вынесено из файлов страниц, три из которых были по 5 800–6 700 строк.',
        },
        {
          category: 'mobile',
          featured: true,
          text: 'Обновил мобильное приложение через две мажорные версии SDK (Expo 54 → 57, React Native 0.81 → 0.86) с новой архитектурой, выпустил версию 1.3.0 и настроил канальные OTA-обновления. Тот же код запущен как веб-версия — без отдельной кодовой базы и вёрстки.',
        },
        {
          category: 'backend',
          text: 'Сделал с нуля серверную часть электронного табеля: транзакционная запись под замком «сотрудник-день», офлайн-досылка отметок с телефона по ключу идемпотентности, история правок.',
        },
        {
          category: 'backend',
          text: 'Перевёл унаследованный сырой SQL на query builder: снято около 190 ручных аннотаций типов, 12 из 16 рукописных jsonb-типов расходились с боевыми данными. Привёл описание схемы к боевой базе, завёл 14 миграций и нашёл блокер выката — нехватку прав на 29 последовательностях из 72.',
        },
        {
          category: 'frontend',
          text: 'Перевёл интерфейс с Tailwind на CSS-модули: 129 модулей и все 71 экран, с посселекторной сверкой «до/после» — 3944 атрибута без расхождений.',
        },
        {
          category: 'frontend',
          text: 'Свёл дубли: каталог документов один вместо шести, единицы измерения одна таблица вместо семи, обёртка карточки вместо копии в 35 файлах маршрутов; удалено 20 неиспользуемых серверных действий, 141 импорт и 16 зависимостей.',
        },
        {
          category: 'frontend',
          text: 'Сделал трёхъязычный интерфейс (ru/en/tr): 354 подписи, переводные справочники, ФИО и даты форматируются по языку интерфейса.',
        },
        {
          category: 'mobile',
          text: 'До рефакторинга 58% кода приложения лежало прямо в файлах маршрутов: слой маршрутов 20 723 → 1 319 строк, 63 из 65 маршрутов стали трёхстрочными делегациями, между ролями удалено около 6 400 строк копипасты.',
        },
        {
          category: 'quality',
          text: 'Ввёл линтер, типы и тесты там, где не было ничего: 218 файлов из 218 переведены на TypeScript, с нуля добавлено 252 теста.',
        },
      ],
    },
    {
      slug: 'alfa-forex',
      company: 'ООО Альфа-Форекс',
      companyNote: 'Финансовое посредничество: брокерская деятельность, обслуживание карт',
      role: 'Fullstack-разработчик',
      period: 'Май 2023 — Февраль 2026',
      dateStart: '2023-05',
      dateEnd: '2026-02',
      location: 'Москва',
      summary:
        'Два продукта: веб- и мобильное приложения интеграции Альфа-банка с торговой платформой MetaTrader и сервис ИИ-подбора планировок квартир.',
      achievements: [
        {
          category: 'frontend',
          featured: true,
          text: 'Разработал веб-часть приложения Альфа-банк × MetaTrader: 31 ключевая страница — авторизация по почте и через банк, котировки, портфель, торговые операции, управление позициями, история сделок, документация.',
        },
        {
          category: 'mobile',
          featured: true,
          text: 'Сделал то же приложение мобильным на React Native: 31 экран, навигация на Expo Router, публикация и поддержка в App Store, Google Play, TestFlight и APK-сборке.',
        },
        {
          category: 'quality',
          featured: true,
          text: 'Оптимизировал рендеринг живых котировок (мемоизация, FlatList) и покрыл модули тестами на Jest; в команде из трёх человек — перекрёстное код-ревью со вторым разработчиком и работа с дизайнером от макетов до реализации.',
        },
        {
          category: 'frontend',
          featured: true,
          text: 'Собрал клиент ИИ-подбора планировок квартир: 12 страниц и конструктор планировок на Canvas API с Fabric.js, обмен с сервером по tRPC — загрузка плана, распознавание, выдача результатов.',
        },
        {
          category: 'backend',
          text: 'Серверную часть подбора планировок сделал на NestJS: tRPC для веб- и мобильного клиентов, PostgreSQL с миграциями и Drizzle, интеграция собственной ИИ-модели распознавания.',
        },
        {
          category: 'mobile',
          text: 'Мобильный клиент подбора: работа с камерой и файловой системой, офлайн-кэширование результатов, MMKV вместо обычного хранилища.',
        },
        {
          category: 'backend',
          text: 'Интеграция с REST API Альфа-банка и протоколом MetaTrader: единый слой данных для двух клиентов, чтобы веб и мобайл не разъезжались в цифрах.',
        },
      ],
    },
    {
      slug: 'sitronics',
      company: 'SITRONICS',
      companyNote: 'ИТ-интегратор: разработка ПО и автоматизация бизнес-процессов',
      role: 'Fullstack-разработчик',
      period: 'Август 2021 — Март 2023',
      dateStart: '2021-08',
      dateEnd: '2023-03',
      location: 'Москва',
      summary:
        'Складское приложение приёмки продукции, корпоративная система учёта персонала IPMS и внешние сайты на Next.js — от вёрстки до серверной части.',
      achievements: [
        {
          category: 'mobile',
          featured: true,
          text: 'Разработал приложение на React Native для приёмки продукции со штрих-кодом: около 20 экранов — сканирование, сверка с накладной, отправка на сервер. Приложение эксплуатируется на реальном складе.',
        },
        {
          category: 'frontend',
          featured: true,
          text: 'Переделал фронтенд IPMS — системы учёта сотрудников, отпусков и иерархии отделов: редизайн, списки с фильтрами, карточка сотрудника, схема иерархии; рефакторинг с пропсов и Context на Redux Toolkit.',
        },
        {
          category: 'backend',
          featured: true,
          text: 'Собрал портал Betalife на Next.js вместе с серверной частью на Node.js и PostgreSQL: главная, рубрики, новости, исследования и личный кабинет.',
        },
        {
          category: 'frontend',
          text: 'Внешний новостной сайт на Next.js: больше 30 страниц и шаблонов, SSR, интеграция с CMS и работа с API.',
        },
        {
          category: 'quality',
          text: 'Интеграция с Node.js-бэкендом по REST, React Navigation и Redux Toolkit в складском приложении, Jest-тесты на клиентских модулях.',
        },
      ],
    },
  ],
  projects: [
    {
      slug: 'alfa-metatrader',
      name: 'Альфа-банк × MetaTrader',
      summary:
        'Веб- и мобильное приложение, связывающее сервисы Альфа-банка с торговой платформой: авторизация, котировки, портфель, торговые операции, управление позициями, история сделок.',
      year: '2023–2026',
      stack: ['Next.js', 'React', 'TypeScript', 'React Native', 'Expo Router', 'Zustand', 'CSS Modules', 'Jest', 'REST'],
    },
    {
      slug: 'ai-flat-layout',
      name: 'ИИ-подбор планировок квартир',
      summary:
        'Клиент для подбора планировок: конструктор на Canvas API и Fabric.js, распознавание собственной ИИ-моделью, единый tRPC-контракт для веба, мобайла и сервера на NestJS.',
      year: '2024–2026',
      stack: ['Next.js', 'React Native', 'Expo', 'NestJS', 'tRPC', 'PostgreSQL', 'Drizzle', 'Canvas API', 'Fabric.js', 'MMKV'],
    },
    {
      slug: 'worktime-platform',
      name: 'Платформа учёта рабочего времени',
      summary:
        'Кадры, дисциплина и табель на строительных объектах: админ-панель, бэкенд на NestJS и мобильное приложение рабочих и бригадиров, около 1500 сотрудников в боевой эксплуатации.',
      year: '2026',
      stack: ['NestJS', 'Fastify', 'Drizzle', 'PostgreSQL', 'tRPC', 'Next.js', 'React Native', 'Expo', 'Vitest', 'Docker'],
    },
    {
      slug: 'electronic-timesheet',
      name: 'Электронный табель',
      summary:
        'Серверная часть и мобильная экранка: транзакционная запись под замком «сотрудник-день», офлайн-очередь отметок с досылкой по ключу идемпотентности, выгрузки по бумажному образцу.',
      year: '2026',
      stack: ['NestJS', 'PostgreSQL', 'React Native', 'Expo', 'TypeScript'],
    },
    {
      slug: 'barcode-acceptance',
      name: 'Приёмка продукции со штрих-кодом',
      summary:
        'Складское приложение: сканирование, сверка с накладной, отправка на сервер. Около 20 экранов, работает на реальном складе заказчика.',
      year: '2021–2023',
      stack: ['React Native', 'Redux Toolkit', 'React Navigation', 'Node.js', 'REST'],
    },
  ],
  skillGroups: [
    {
      slug: 'languages',
      name: 'Языки и типизация',
      skills: [
        { name: 'TypeScript', featured: true, note: 'Основной язык; границы системы держу типами и zod-схемами' },
        { name: 'JavaScript', note: 'До TypeScript — Node.js-серверы и клиент на нём же' },
        { name: 'SQL', featured: true, note: 'Схемы, миграции, разбор сырого наследия под query builder' },
      ],
    },
    {
      slug: 'frontend',
      name: 'Фронтенд',
      skills: [
        { name: 'Next.js', featured: true, note: 'App Router и статический экспорт — этот сайт собран так' },
        { name: 'React', note: 'Мемоизация живых списков котировок, серверные компоненты' },
        { name: 'CSS Modules', featured: true, note: 'Перевёл 71 экран с Tailwind на модули; темы — CSS-переменными' },
        { name: 'Zustand / Redux Toolkit', note: 'Оба — в бою, выбор по размеру приложения' },
        { name: 'Canvas API, Fabric.js', note: 'Конструктор планировок квартир' },
      ],
    },
    {
      slug: 'backend',
      name: 'Бэкенд и данные',
      skills: [
        { name: 'NestJS', featured: true, note: '50 доменных модулей и 497 REST-ручек на Fastify-платформе' },
        { name: 'Node.js', featured: true },
        { name: 'GraphQL', featured: true, note: 'В этом проекте — слой контракта визитки: code-first SDL и GraphiQL' },
        { name: 'Prisma', note: 'Миграции, сид и клиент этого API' },
        { name: 'PostgreSQL', note: 'Drizzle ORM, миграции, разбор расхождений jsonb-типов с боевыми данными' },
        { name: 'tRPC', note: '487 процедур зеркально к REST-контракту' },
        { name: 'MongoDB', note: 'Учебные и первые коммерческие проекты' },
      ],
    },
    {
      slug: 'mobile',
      name: 'Мобильное',
      skills: [
        { name: 'React Native', featured: true, note: 'Три продукта в бою: склад, биржа, табель' },
        { name: 'Expo / Expo Router', featured: true, note: 'Обновления через две мажорные версии SDK, OTA-каналы' },
        { name: 'MMKV', note: 'Офлайн-кэш результатов и очередь отметок' },
      ],
    },
    {
      slug: 'delivery',
      name: 'Качество и поставка',
      skills: [
        { name: 'Docker', featured: true, note: 'Multi-stage образ API вместе со статикой; compose для локального прогона' },
        { name: 'Jest / Vitest', featured: true, note: '410 spec-файлов и 4000+ тестов, поднятые с нуля' },
        { name: 'CI-гейты', note: 'typecheck, линтер, тесты и проверка направления импортов в пайплайне' },
        { name: 'Git', note: 'Ветки, ревью, история как часть сдачи' },
      ],
    },
  ],
  languages: [
    { name: 'Русский', level: 'native' },
    { name: 'Английский', level: 'b1' },
    { name: 'Французский', level: 'b1' },
  ],
  education: [
    {
      school: 'Московский государственный университет экономики, статистики и информатики (МЭСИ)',
      year: '2012',
      degree: 'Экономика и финансы, финансовый менеджмент — специалист',
      note: 'Высшее образование; в код пришёл из смежной области',
    },
    {
      school: 'Elbrus Bootcamp',
      year: '2020–2021',
      degree: 'Интенсивная программа fullstack-разработчиков',
      note: 'React, Node.js, MongoDB; командный проект Doctor House — авторизация, WebSocket-чат, email-нотификации',
    },
  ],
  contacts: [
    { kind: 'telegram', label: '@voltigeurs', url: 'https://t.me/voltigeurs', visibility: 'public' },
    { kind: 'github', label: 'github.com/Ricorder', url: 'https://github.com/Ricorder', visibility: 'public' },
    { kind: 'email', label: 'brugdorf@inbox.ru', url: 'mailto:brugdorf@inbox.ru', visibility: 'public' },
  ],
}
