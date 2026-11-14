# FILM!

REST API и клиент онлайн-кинотеатра «FILM!»: каталог фильмов, расписание сеансов и бронирование билетов.

**Стек:** NestJS 10, TypeScript, PostgreSQL, TypeORM, `@nestjs/config`, `@nestjs/serve-static`, `class-validator` / `class-transformer`. Фронтенд — React + Vite.

**Реализовано:**

* `GET /films` — список фильмов в формате `{ total, items }`.
* `GET /films/:id/schedule` — расписание сеансов фильма (`404`, если фильм не найден).
* `POST /order` — бронирование билетов: валидация DTO, проверка фильма и сеанса, границ ряда и места, занятости мест.
* Статика: изображения фильмов по `/content/afisha`.


Запуск:

```bash
npm run dev
```
