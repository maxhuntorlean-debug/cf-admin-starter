# cf-admin-starter

Универсальная админ-панель для проектов на базе `cf-auth-starter`.

Поддерживает:

- login / logout
- проверку текущего пользователя
- `admin.access`
- список пользователей
- создание и редактирование пользователей
- смену пароля пользователя
- роли
- permissions
- создание и редактирование ролей
- создание и редактирование permissions
- назначение permissions ролям
- PWA
- deploy на Cloudflare Workers Static Assets

## Связка с API

Админка рассчитана на API со следующими маршрутами:

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout

GET  /api/admin/users
GET  /api/admin/users/:id
POST /api/admin/users
PUT  /api/admin/users/:id
PUT  /api/admin/users/:id/password

GET  /api/admin/roles
POST /api/admin/roles
PUT  /api/admin/roles/:id

GET  /api/admin/roles/permissions
POST /api/admin/roles/permissions
PUT  /api/admin/roles/permissions/:id

GET  /api/admin/roles/:id/permissions
PUT  /api/admin/roles/:id/permissions
```

Лучше всего использовать вместе с `cf-auth-starter`.

## Быстрый старт нового проекта

После копирования starter нужно изменить только несколько значений.

### 1. API URL

Открой:

```text
public/js/config.js
```

и замени:

```js
export const API_URL = "https://YOUR-API.workers.dev";
```

на адрес нового API.

### 2. Имя Cloudflare Worker

Открой:

```text
wrangler.jsonc
```

и поменяй:

```jsonc
"name": "cf-admin-starter"
```

например на:

```jsonc
"name": "my-project-admin"
```

### 3. Название приложения

При необходимости поменяй:

```text
public/index.html
public/manifest.json
public/js/pages/login.js
public/js/pages/home.js
```

Это только отображаемые названия. Логика API от них не зависит.

## Установка

```bash
npm install
```

Локальный запуск:

```bash
npm run dev
```

Deploy:

```bash
npm run deploy
```

## CORS

API должен разрешать origin этой админки и credentials.

В `cf-auth-starter` для этого используется:

```text
ADMIN_ORIGIN
```

Например:

```text
https://my-project-admin.example.workers.dev
```

Frontend отправляет cookie через:

```js
credentials: "include"
```

## Permissions

Для входа в админ-панель пользователь должен иметь:

```text
admin.access
```

Для раздела пользователей:

```text
users.read
users.create
users.update
```

Для ролей:

```text
roles.read
roles.update
```

Для permissions:

```text
permissions.read
permissions.update
```

Проверки на frontend нужны только для интерфейса. Настоящая защита всегда должна оставаться на backend.

## Структура

```text
public/
├── assets/
├── css/
│   └── style.css
├── js/
│   ├── pages/
│   │   ├── home.js
│   │   ├── login.js
│   │   ├── roles.js
│   │   └── users.js
│   ├── api.js
│   ├── app.js
│   └── config.js
├── index.html
├── manifest.json
└── sw.js
```

## Создание нового проекта из starter

Типовой процесс:

```text
cf-admin-starter
      ↓
новый Git repository
      ↓
поменять API_URL
      ↓
поменять Worker name
      ↓
при необходимости поменять branding
      ↓
npm install
      ↓
npm run deploy
      ↓
добавить URL админки в ADMIN_ORIGIN API
```

После этого можно добавлять новые бизнес-разделы, не переписывая auth/users/roles/permissions ядро.
