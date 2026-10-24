import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

interface FilmItem {
  id: string;
  title: string;
  rating: number;
  tags: string[];
}

interface ScheduleItem {
  id: string;
  daytime: string;
  hall: string;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

const FILM_ID = '0e33c7f6-27a7-4aa0-8e61-65d7e5effecf';
const SESSION_ID = 'f2e429b0-685d-41f8-a8cd-1d8cb63b99ce';

// Сеанс с местами, которые уже заняты в сид-данных.
const BUSY_FILM_ID = '5b70cb1a-61c9-47b1-b207-31f9e89087ff';
const BUSY_SESSION_ID = '793009d6-030c-4dd4-8d13-9ba500724b38';

const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000';

describe('Afisha API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Повторяем конфигурацию bootstrap из main.ts, чтобы тесты проверяли
    // реальные маршруты и валидацию DTO.
    app.setGlobalPrefix('api/afisha');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const getFilms = async (): Promise<FilmItem[]> => {
    const { body } = await request(app.getHttpServer())
      .get('/api/afisha/films')
      .expect(200);
    return body.items;
  };

  const getSchedule = async (filmId: string): Promise<ScheduleItem[]> => {
    const { body } = await request(app.getHttpServer())
      .get(`/api/afisha/films/${filmId}/schedule`)
      .expect(200);
    return body.items;
  };

  const getFreeSeats = async (
    filmId: string,
    sessionId: string,
    count: number
  ): Promise<{
    session: ScheduleItem;
    seats: { row: number; seat: number }[];
  }> => {
    const schedule = await getSchedule(filmId);
    const session = schedule.find((item) => item.id === sessionId);
    expect(session).toBeDefined();

    const taken = new Set(session.taken);
    const seats: { row: number; seat: number }[] = [];
    for (let row = 1; row <= session.rows; row++) {
      for (let seat = 1; seat <= session.seats; seat++) {
        if (!taken.has(`${row}:${seat}`)) {
          seats.push({ row, seat });
          if (seats.length === count) return { session, seats };
        }
      }
    }

    throw new Error(`В сеансе ${sessionId} меньше ${count} свободных мест`);
  };

  const buildTicket = (
    filmId: string,
    session: ScheduleItem,
    row: number,
    seat: number
  ) => ({
    film: filmId,
    session: session.id,
    daytime: session.daytime,
    row,
    seat,
    price: session.price,
  });

  const buildOrder = (tickets: ReturnType<typeof buildTicket>[]) => ({
    email: 'customer@example.com',
    phone: '+79990000000',
    tickets,
  });

  describe('GET /api/afisha/films', () => {
    it('возвращает список фильмов', async () => {
      const items = await getFilms();

      expect(items.length).toBeGreaterThan(0);
      expect(items.map((item) => item.id)).toContain(FILM_ID);
      expect(items[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          rating: expect.any(Number),
          tags: expect.any(Array),
        })
      );
    });
  });

  describe('GET /api/afisha/films/:id/schedule', () => {
    it('возвращает расписание сеансов фильма', async () => {
      const items = await getSchedule(FILM_ID);

      expect(items.length).toBeGreaterThan(0);
      expect(items.map((item) => item.id)).toContain(SESSION_ID);
      expect(items[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          daytime: expect.any(String),
          hall: expect.any(String),
          rows: expect.any(Number),
          seats: expect.any(Number),
          price: expect.any(Number),
          taken: expect.any(Array),
        })
      );
    });

    it('отдаёт 404, если фильм не найден', () =>
      request(app.getHttpServer())
        .get(`/api/afisha/films/${UNKNOWN_ID}/schedule`)
        .expect(404));

    it('отдаёт 400, если id не является uuid', () =>
      request(app.getHttpServer())
        .get('/api/afisha/films/not-a-uuid/schedule')
        .expect(400));
  });

  describe('POST /api/afisha/order', () => {
    it('оформляет заказ и возвращает билеты с уникальными id', async () => {
      const { session, seats } = await getFreeSeats(FILM_ID, SESSION_ID, 2);
      const tickets = seats.map(({ row, seat }) =>
        buildTicket(FILM_ID, session, row, seat)
      );

      const { body } = await request(app.getHttpServer())
        .post('/api/afisha/order')
        .send(buildOrder(tickets))
        .expect(200);

      expect(body.total).toBe(tickets.length);
      expect(body.items).toHaveLength(tickets.length);
      expect(new Set(body.items.map((item) => item.id)).size).toBe(
        tickets.length
      );
      body.items.forEach((item, index) => {
        expect(item).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            film: FILM_ID,
            session: SESSION_ID,
            daytime: session.daytime,
            row: tickets[index].row,
            seat: tickets[index].seat,
          })
        );
      });

      const schedule = await getSchedule(FILM_ID);
      const updated = schedule.find((item) => item.id === SESSION_ID);
      seats.forEach(({ row, seat }) =>
        expect(updated.taken).toContain(`${row}:${seat}`)
      );
    });

    it('отклоняет повторное бронирование тех же мест', async () => {
      const { session, seats } = await getFreeSeats(FILM_ID, SESSION_ID, 1);
      const order = buildOrder([
        buildTicket(FILM_ID, session, seats[0].row, seats[0].seat),
      ]);

      await request(app.getHttpServer())
        .post('/api/afisha/order')
        .send(order)
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/afisha/order')
        .send(order)
        .expect(400);
    });

    it('отклоняет бронирование уже занятого места', async () => {
      const schedule = await getSchedule(BUSY_FILM_ID);
      const session = schedule.find((item) => item.id === BUSY_SESSION_ID);
      const [row, seat] = session.taken[0].split(':').map(Number);

      await request(app.getHttpServer())
        .post('/api/afisha/order')
        .send(buildOrder([buildTicket(BUSY_FILM_ID, session, row, seat)]))
        .expect(400);
    });

    it('отклоняет место за пределами зала', async () => {
      const schedule = await getSchedule(FILM_ID);
      const session = schedule.find((item) => item.id === SESSION_ID);

      await request(app.getHttpServer())
        .post('/api/afisha/order')
        .send(buildOrder([buildTicket(FILM_ID, session, session.rows + 1, 1)]))
        .expect(400);
    });

    it('отдаёт 404, если сеанс не найден', async () => {
      const schedule = await getSchedule(FILM_ID);
      const session = schedule.find((item) => item.id === SESSION_ID);

      await request(app.getHttpServer())
        .post('/api/afisha/order')
        .send(
          buildOrder([
            { ...buildTicket(FILM_ID, session, 1, 1), session: UNKNOWN_ID },
          ])
        )
        .expect(404);
    });

    it('отдаёт 400 на невалидное тело запроса', () =>
      request(app.getHttpServer())
        .post('/api/afisha/order')
        .send({ email: 'not-an-email', phone: '', tickets: [] })
        .expect(400));
  });
});