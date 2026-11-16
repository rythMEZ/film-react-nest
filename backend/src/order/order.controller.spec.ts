import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { OrderController } from './order.controller';
import { OrderDto, OrderResult } from './dto/order.dto';
import { OrderService } from './order.service';

const FILM_ID = '0e33c7f6-27a7-4aa0-8e61-65d7e5effecf';
const SESSION_ID = 'f2e429b0-685d-41f8-a8cd-1d8cb63b99ce';

describe('OrderController', () => {
  let app: INestApplication;
  const orderService = {
    create: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: orderService,
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

  describe('POST /order', () => {
    it('передаёт заказ в сервис и возвращает оформленные билеты', async () => {
      const order: OrderDto = {
        email: 'customer@example.com',
        phone: '+79990000000',
        tickets: [
          {
            film: FILM_ID,
            session: SESSION_ID,
            daytime: '2026-11-14T10:00:00.000Z',
            row: 2,
            seat: 3,
            price: 500,
          },
        ],
      };
      const result: OrderResult = {
        total: 1,
        items: [
          {
            id: '7e5b06be-e327-4c73-a96d-5a81d95f7c8a',
            film: FILM_ID,
            session: SESSION_ID,
            daytime: '2026-11-14T10:00:00.000Z',
            row: 2,
            seat: 3,
            price: 500,
          },
        ],
      };
      orderService.create.mockResolvedValue(result);

      await request(app.getHttpServer())
        .post('/order')
        .send(order)
        .expect(200)
        .expect(result);

      expect(orderService.create).toHaveBeenCalledWith(order);
    });

    it('возвращает ошибку сервиса без изменения её статуса', async () => {
      const order: OrderDto = {
        email: 'customer@example.com',
        phone: '+79990000000',
        tickets: [
          {
            film: FILM_ID,
            session: SESSION_ID,
            daytime: '2026-11-14T10:00:00.000Z',
            row: 1,
            seat: 1,
            price: 500,
          },
        ],
      };
      orderService.create.mockRejectedValue(
        new BadRequestException('Место уже занято'),
      );

      await request(app.getHttpServer())
        .post('/order')
        .send(order)
        .expect(400)
        .expect({
          message: 'Место уже занято',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });
});
