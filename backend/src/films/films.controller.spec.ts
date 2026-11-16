import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { FilmDto, ScheduleDto } from './dto/films.dto';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

const FILM_ID = '0e33c7f6-27a7-4aa0-8e61-65d7e5effecf';

describe('FilmsController', () => {
  let app: INestApplication;
  const filmsService = {
    findAll: jest.fn(),
    findScheduleById: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: filmsService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /films', () => {
    it('возвращает фильмы и их общее количество', async () => {
      const films: FilmDto[] = [
        {
          id: FILM_ID,
          rating: 8.1,
          director: 'Режиссёр',
          tags: ['драма'],
          title: 'Фильм',
          about: 'Краткое описание',
          description: 'Полное описание',
          image: '/image.jpg',
          cover: '/cover.jpg',
        },
      ];
      filmsService.findAll.mockResolvedValue(films);

      await request(app.getHttpServer()).get('/films').expect(200).expect({
        total: films.length,
        items: films,
      });

      expect(filmsService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /films/:id/schedule', () => {
    it('передаёт id фильма в сервис и возвращает расписание', async () => {
      const schedule: ScheduleDto[] = [
        {
          id: 'f2e429b0-685d-41f8-a8cd-1d8cb63b99ce',
          daytime: '2026-11-14T10:00:00.000Z',
          hall: 1,
          rows: 10,
          seats: 12,
          price: 500,
          taken: ['1:1'],
        },
      ];
      filmsService.findScheduleById.mockResolvedValue(schedule);

      await request(app.getHttpServer())
        .get(`/films/${FILM_ID}/schedule`)
        .expect(200)
        .expect({
          total: schedule.length,
          items: schedule,
        });

      expect(filmsService.findScheduleById).toHaveBeenCalledWith(FILM_ID);
    });

    it('возвращает 400 и не вызывает сервис для невалидного UUID', async () => {
      await request(app.getHttpServer())
        .get('/films/not-a-uuid/schedule')
        .expect(400);

      expect(filmsService.findScheduleById).not.toHaveBeenCalled();
    });

    it('возвращает 404, если сервис не нашёл фильм', async () => {
      filmsService.findScheduleById.mockRejectedValue(
        new NotFoundException('Фильм не найден'),
      );

      await request(app.getHttpServer())
        .get(`/films/${FILM_ID}/schedule`)
        .expect(404)
        .expect({
          message: 'Фильм не найден',
          error: 'Not Found',
          statusCode: 404,
        });
    });
  });
});
