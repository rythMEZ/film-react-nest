## О проекте

REST API онлайн-кинотеатра «FILM!»: каталог фильмов, расписания сеансов и бронирование билетов.

**Стек:** NestJS 10, TypeScript, MongoDB + Mongoose, `@nestjs/config`, `@nestjs/serve-static`, `class-validator` / `class-transformer`.

**Реализовано:**

* `GET /films` — список фильмов в формате `{ total, items }`.
* `GET /films/:id/schedule` — расписание сеансов фильма (`404`, если фильм не найден).
* `POST /order` — бронирование билетов: валидация DTO, проверка существования фильма и сеанса, границ ряда и места, занятости мест и откат уже занятых мест при частичной ошибке.

* Статика: изображения фильмов по `/content/afisha`.

**Архитектура:** слои controller → service → repository; доступ к данным через абстракцию `FilmsRepository` с двумя реализациями (Mongo и in-memory), выбор через `DATABASE_DRIVER`; глобальный `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`), конфигурация через `.env`.
