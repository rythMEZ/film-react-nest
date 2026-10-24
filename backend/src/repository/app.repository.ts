import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';
import { FilmsRepository } from './films.repository';

@Injectable()
export class AppRepository implements FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<FilmDto> {
    const film = await this.filmRepository.findOne({ where: { id } });
    return film ? this.mapFilmToDto(film) : null;
  }

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmRepository.find();
    return films.map((film) => this.mapFilmToDto(film));
  }

  async findScheduleById(id: string): Promise<ScheduleDto[] | null> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: { schedule: true },
    });

    return film
      ? (film.schedule ?? []).map((schedule) => this.mapScheduleToDto(schedule))
      : null;
  }

  async findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleDto | null> {
    const session = await this.scheduleRepository.findOne({
      where: { id: sessionId, filmId },
    });

    return session ? this.mapScheduleToDto(session) : null;
  }

  async addTakenSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const session = await manager
        .createQueryBuilder(Schedule, 'schedule')
        .setLock('pessimistic_write')
        .where('schedule.id = :sessionId', { sessionId })
        .andWhere('schedule.filmId = :filmId', { filmId })
        .getOne();

      if (!session) return false;

      const taken = this.parseTextArray(session.taken);
      const takenSet = new Set(taken);
      const uniqueSeats = [...new Set(seats)];

      if (uniqueSeats.some((seat) => takenSet.has(seat))) return false;

      session.taken = [...taken, ...uniqueSeats];
      await manager.save(session);
      return true;
    });
  }

  async removeTakenSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const session = await manager
        .createQueryBuilder(Schedule, 'schedule')
        .setLock('pessimistic_write')
        .where('schedule.id = :sessionId', { sessionId })
        .andWhere('schedule.filmId = :filmId', { filmId })
        .getOne();

      if (!session) return;

      const seatsToRemove = new Set(seats);
      session.taken = this.parseTextArray(session.taken).filter(
        (seat) => !seatsToRemove.has(seat),
      );

      await manager.save(session);
    });
  }

  private mapFilmToDto(film: Film): FilmDto {
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: this.parseTextArray(film.tags),
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    };
  }

  private mapScheduleToDto(schedule: Schedule): ScheduleDto {
    return {
      id: schedule.id,
      daytime: schedule.daytime,
      hall: `${schedule.hall}`,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: this.parseTextArray(schedule.taken),
    };
  }

  private parseTextArray(
    value: string | string[] | null | undefined,
  ): string[] {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}
