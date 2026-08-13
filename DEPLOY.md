# Деплой на Vercel — пошагово

Стек: **Vercel** + **Neon** (Postgres) + **Resend** (письма) + **Upstash**
(rate limiting). Все четыре — бесплатно для проекта такого масштаба.

## Шаг 0 — GitHub
```bash
git init
git add .
git commit -m "Initial commit"
```
Создайте пустой репозиторий на github.com и запушьте код.

## Шаг 1 — база данных (Neon)
1. Зарегистрируйтесь на neon.tech (без карты)
2. Создайте проект, скопируйте **Connection string**
3. Вставьте в `.env` как `DATABASE_URL`
4. `npx prisma migrate dev --name init` — создаст `prisma/migrations`,
   обязательно закоммитьте эту папку в git

## Шаг 2 — письма (Resend)
1. Зарегистрируйтесь на resend.com
2. **API Keys** → создайте ключ → `RESEND_API_KEY`
3. **Domains** → добавьте свой домен, пропишите DNS-записи
4. Без верификации домена можно слать только на свой же email — для
   реальных пользователей домен верифицировать обязательно
5. `MAIL_FROM` — адрес на этом домене

## Шаг 3 — rate limiting (Upstash)
1. Зарегистрируйтесь на upstash.com (без карты)
2. Создайте Redis-базу
3. На странице базы, блок **REST API** → скопируйте
   `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN`

## Шаг 4 — деплой на Vercel
1. Зарегистрируйтесь на vercel.com через GitHub
2. **Add New → Project** → выберите репозиторий
3. В **Environment Variables** добавьте все переменные из `.env`:
   `DATABASE_URL`, `TMDB_API_KEY`, `APP_URL` (можно временно
   `https://ваш-проект.vercel.app`), `RESEND_API_KEY`, `MAIL_FROM`,
   `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
4. **Deploy**

## Шаг 5 — после деплоя
- Проверьте регистрацию и реальную доставку письма
- Если `APP_URL` не совпадал с реальным адресом — поправьте и передеплойте
- В настройках TMDB-ключа замените Application URL на реальный домен
- При изменении `schema.prisma` — коммитьте `prisma/migrations` и
  прогоняйте `npx prisma migrate deploy` с прод-строкой подключения
