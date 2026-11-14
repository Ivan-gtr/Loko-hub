# LOKO HUB 🚂

Независимая фанатская платформа ФК «Локомотив» Москва — матч-центр, медиа и сообщество болельщиков.

> ⚠️ Платформа не является официальным приложением клуба.

## Разделы

- **Главная** — ближайший матч, последний результат, опрос дня, переходы в разделы
- **Матчи** — расписание, live-счёт, результаты, матч-центр (Highlightly)
- **LOKO MEDIA** — новости, видео, подкасты, стримы и проекты (Supabase)
- **Состав** — игроки команды сезона 2026/2027 (Supabase, единый источник)
- **Болельщики** — опросы и голосования (Supabase, серверный подсчёт)

## Технологии

- Frontend: HTML, CSS, JavaScript (vanilla, SPA без сборки)
- Backend: Netlify Functions (CommonJS, Node.js ≥ 18)
- База данных: Supabase (PostgreSQL), миграции в `supabase/migrations/`
- Футбольные данные: Highlightly API (ключ только на сервере)
- Хостинг: Netlify, деплой GitHub → Netlify
- Тесты: встроенный `node:test` (запуск: `npm test`)

## Локальный запуск

Нужны Node.js ≥ 18 и [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
npm install
npm install -g netlify-cli   # один раз
netlify login                # один раз
npm run dev                  # сайт + Netlify Functions на http://localhost:8888
```

Команда `npm run dev` — единственный корректный способ локальной разработки:
frontend обращается к `/.netlify/functions/*`, которые поднимает именно
`netlify dev` (вместе с переменными из `.env`).

⚠️ `npm run dev:static` (и `open-loko-hub.cmd`) поднимают **только статику**
(порт 8765, PowerShell). Матчи, состав, медиа и голосования через него
работать **не будут** — только вёрстка без данных.

## Переменные окружения

Скопируйте `.env.example` → `.env` и заполните значения (локально их
подхватывает `netlify dev`; в проде ключи задаются в Netlify →
Site settings → Environment variables):

| Переменная | Описание |
|---|---|
| `HIGHLIGHTLY_API_KEY` | API-ключ Highlightly Soccer |
| `SUPABASE_URL` | URL проекта Supabase |
| `SUPABASE_ANON_KEY` | Публичный ключ Supabase (anon) |
| `SUPABASE_SERVICE_KEY` | Серверный ключ Supabase (service_role), только на сервере |
| `VOTE_FINGERPRINT_SALT` | Соль для fingerprint голосов (случайная строка, напр. `openssl rand -hex 32`) |

## Деплой

Автоматический через GitHub → Netlify.
Продакшн: [loko-hub.netlify.app](https://loko-hub.netlify.app)

## Структура проекта

```
├── index.html                    — SPA-разметка (5 экранов + экраны деталей)
├── script.js                     — клиентская логика
├── style.css                     — стили
├── netlify.toml                  — деплой, расписания планировщиков, security-заголовки
├── package.json                  — npm-скрипты и зависимости
├── data/
│   ├── squad-2026-2027.json      — проверенный состав (источник миграции; fallback клиента)
│   └── squad-2026-2027-report.md — отчёт о проверке состава по источникам
├── netlify/functions/
│   ├── football.js               — матчи: handler (валидация входа, HTTP-статусы)
│   ├── refresh-football.js       — планировщик прогрева кэша матчей (*/30 мин)
│   ├── squad.js                  — состав из Supabase (кэш 6 ч, fallback на кэш)
│   ├── content.js                — медиа-лента из Supabase (категории, кэш 10 мин)
│   ├── refresh-content.js        — планировщик сбора RSS-источников (*/30 мин)
│   ├── polls.js                  — активные опросы с серверным подсчётом голосов
│   ├── vote.js                   — приём голосов (fingerprint, rate-limit, 409 при повторе)
│   └── lib/
│       ├── supabase.js           — ленивые клиенты Supabase (admin/anon)
│       ├── cache.js              — серверный кэш через таблицу cache (TTL)
│       ├── football-service.js   — ядро матч-центра: Highlightly + retry/backoff,
│       │                           нормализация, кэш, fallback, запись в matches
│       └── rss.js                — парсер RSS 2.0 / Atom без внешних зависимостей
├── supabase/migrations/
│   ├── 001_initial_schema.sql    — схема БД: 10 таблиц + индексы + RLS-политики
│   └── 002_players_unique.sql    — уникальный индекс players(team_id, name)
├── scripts/
│   ├── migrate-squad.js          — загрузка состава JSON → Supabase (идемпотентно)
│   ├── seed-sources.js           — реестр источников MEDIA первой волны (неактивных)
│   ├── add-content.js            — ручное добавление материала-карточки со ссылкой
│   ├── create-poll.js            — создание опроса (административный)
│   └── close-poll.js             — закрытие опроса (административный)
├── tests/                        — node:test
│   ├── football-service.test.js  — хелперы матч-центра
│   ├── rss.test.js               — парсер лент
│   ├── polls-logic.test.js       — логика активности опросов
│   ├── vote-logic.test.js        — fingerprint, валидация голоса
│   └── security.test.js          — сканер секретов в коде, проверка .gitignore
├── start-loko-hub-tcp.ps1        — статический сервер (только вёрстка, порт 8765)
├── start-loko-hub-server.ps1     — альтернативный статический сервер (HttpListener)
└── open-loko-hub.cmd             — запуск статического сервера двойным кликом
```

## Миграции базы данных

Миграции применяются в Supabase SQL Editor **вручную, по порядку** —
сначала `001_initial_schema.sql`, затем `002_players_unique.sql`.
Автоматического применения из кода нет: к production-базе миграции
не применяются без явного действия администратора.

- **001** — таблицы: `sources`, `content_items`, `matches`, `match_events`,
  `teams`, `players`, `polls`, `poll_votes`, `ingestion_runs`, `cache`;
  индексы и политики RLS (публичное чтение контента/матчей/опросов,
  публичная вставка голосов, серверный доступ к `sources`/`cache`/`ingestion_runs`).
- **002** — уникальный индекс `players(team_id, name)` для идемпотентной
  загрузки состава.

## Фоновые задачи (Netlify Scheduled Functions)

Расписание задано в `netlify.toml` (каждые 30 минут):

| Функция | Что делает | Куда пишет |
|---|---|---|
| `refresh-football` | Прогревает кэш матчей из Highlightly | `cache`, `matches`, `ingestion_runs` |
| `refresh-content` | Опрашивает активные RSS-источники MEDIA: сбор → нормализация → дедупликация | `content_items`, `sources.last_checked_at`, `ingestion_runs` |

Пока идёт live-матч, TTL кэша матчей 60 с: свежий счёт подтягивают
пользовательские запросы между запусками планировщика.
Ошибка одного медиаисточника не останавливает остальные — каждый
результат фиксируется отдельной записью в `ingestion_runs`.

## Управление данными

- Загрузка состава в БД: `node scripts/migrate-squad.js` (требует `SUPABASE_*`).
- Реестр источников: `node scripts/seed-sources.js` — создаёт источники
  первой волны **неактивными**; активация (RSS-лента + `is_active = true`)
  — только после согласования прав на контент.
- Ручной материал: `node scripts/add-content.js --source "..." --category video --title "..." --url "..."`.
- Опросы: `node scripts/create-poll.js --question "..." --options "А,Б,В" --days 3`
  и `node scripts/close-poll.js --id <uuid>`.
- Статус фоновых задач: таблица `ingestion_runs`; ошибки планировщиков
  также видны в логах Netlify.

## Отказоустойчивость

- Недоступен Highlightly → последний кэш из `cache` с пометкой «устарело»
  и меткой времени; пустой экран не показывается.
- Недоступен Supabase → `squad.js` отвечает из кэша, клиент состава
  падает на локальный проверенный JSON; MEDIA и опросы показывают
  последний кэш, иначе честное сообщение об ошибке.
- Голосование: один голос на опрос (fingerprint + UNIQUE), повтор — 409.

## Тестирование

```bash
npm test
```

Пять файлов на `node:test`: хелперы матч-центра, RSS-парсер, логика
опросов и голосования, сканер секретов в клиентском/серверном коде.

## Известные ограничения

- Логотип в шапке и фоновые фото стадиона загружаются с внешних CDN
  (postimg / fclm.ru). При их недоступности логотип заменяется значком «Л»;
  перенос изображений в `assets/` запланирован после решения о правах.
- LOKO MEDIA получает материалы только из активных разрешённых источников;
  до согласования первой волны раздел может быть пустым (это честное
  пустое состояние, а не демо-заглушки).
- Антифрод голосований — fingerprint (IP + User-Agent + соль), а не
  полноценная аутентификация; накрутка со сменой IP возможна.
- События матча и статистика показываются, только если Highlightly
  отдаёт соответствующие поля на текущем тарифе.
- Rate-limit голосований in-memory (на инстанс функции): при нескольких
  тёплых инстансах лимит фактически выше заявленного.
- Итоги версии 1.4 и чек-лист запуска: см. [RELEASE_REPORT.md](RELEASE_REPORT.md).
