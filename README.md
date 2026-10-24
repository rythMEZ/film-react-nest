# FILM!

## О проекте

REST API онлайн-кинотеатра «FILM!»: каталог фильмов, расписания сеансов и бронирование билетов.

**Стек:** NestJS 10, TypeScript, MongoDB + Mongoose, `@nestjs/config`, `@nestjs/serve-static`, `class-validator` / `class-transformer`.

**Реализовано:**

* `GET /films` — список фильмов в формате `{ total, items }`.
* `GET /films/:id/schedule` — расписание сеансов фильма (`404`, если фильм не найден).
* `POST /order` — бронирование билетов: валидация DTO, проверка существования фильма и сеанса, границ ряда и места, занятости мест и откат уже занятых мест при частичной ошибке.

* Статика: изображения фильмов по `/content/afisha`.

**Архитектура:** слои controller → service → repository; доступ к данным через абстракцию `FilmsRepository` с двумя реализациями (Mongo и in-memory), выбор через `DATABASE_DRIVER`; глобальный `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`), конфигурация через `.env`.

## Установка

### MongoDB

Установите MongoDB скачав дистрибутив с официального сайта или с помощью пакетного менеджера вашей ОС. Также можно воспользоваться Docker (см. ветку `feat/docker`.


### Бэкенд

Перейдите в папку с исходным кодом бэкенда

`cd backend`

Установите зависимости (точно такие же, как в package-lock.json) помощью команд

`npm ci` или `yarn install --frozen-lockfile`

Создайте `.env` файл из примера `.env.example`, в нём укажите:

* `DATABASE_DRIVER` - тип драйвера СУБД - в нашем случае это `mongodb` 
* `DATABASE_URL` - адрес СУБД MongoDB, например `mongodb://127.0.0.1:27017/practicum`.  

MongoDB должна быть установлена и запущена.

Для проверки отправьте тестовый запрос с помощью Postman или `curl`.




