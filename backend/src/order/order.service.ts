import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { ScheduleDto } from '../films/dto/films.dto';
import {
  FILMS_REPOSITORY,
  FilmsRepository,
} from '../repository/films.repository';
import {
  OrderDto,
  OrderedTicket,
  OrderResult,
  TicketDto,
} from './dto/order.dto';

interface OrderGroup {
  film: string;
  session: string;
  seats: string[];
}

@Injectable()
export class OrderService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository
  ) {}

  async create(order: OrderDto): Promise<OrderResult> {
    const groups = this.groupTickets(order.tickets);

    for (const group of groups) {
      const session = await this.filmsRepository.findSession(
        group.film,
        group.session
      );
      if (!session) {
        throw new NotFoundException('Фильм или сеанс не найден');
      }
      this.validateSeatsInHall(group, session);
      this.validateSeatsAreFree(group, session);
    }

    const booked: OrderGroup[] = [];
    for (const group of groups) {
      const added = await this.filmsRepository.addTakenSeats(
        group.film,
        group.session,
        group.seats
      );
      if (!added) {
        await this.rollback(booked);
        throw new BadRequestException('Место уже занято');
      }
      booked.push(group);
    }

    const items: OrderedTicket[] = order.tickets.map((ticket) => ({
      id: randomUUID(),
      film: ticket.film,
      session: ticket.session,
      daytime: ticket.daytime,
      row: ticket.row,
      seat: ticket.seat,
      price: ticket.price,
    }));

    return { total: items.length, items };
  }

  private groupTickets(tickets: TicketDto[]): OrderGroup[] {
    const groups = new Map<string, OrderGroup>();

    for (const ticket of tickets) {
      const key = `${ticket.film}:${ticket.session}`;
      const seat = `${ticket.row}:${ticket.seat}`;
      let group = groups.get(key);
      if (!group) {
        group = { film: ticket.film, session: ticket.session, seats: [] };
        groups.set(key, group);
      }
      if (group.seats.includes(seat)) {
        throw new BadRequestException('Место уже занято');
      }
      group.seats.push(seat);
    }

    return [...groups.values()];
  }

  private validateSeatsInHall(group: OrderGroup, session: ScheduleDto): void {
    const invalid = group.seats.some((seat) => {
      const [row, place] = seat.split(':').map(Number);
      return (
        row < 1 || row > session.rows || place < 1 || place > session.seats
      );
    });

    if (invalid) {
      throw new BadRequestException('Некорректный ряд или место');
    }
  }

  private validateSeatsAreFree(group: OrderGroup, session: ScheduleDto): void {
    const taken = new Set(session.taken);
    if (group.seats.some((seat) => taken.has(seat))) {
      throw new BadRequestException('Место уже занято');
    }
  }

  private async rollback(groups: OrderGroup[]): Promise<void> {
    for (const group of groups) {
      await this.filmsRepository.removeTakenSeats(
        group.film,
        group.session,
        group.seats
      );
    }
  }
}
