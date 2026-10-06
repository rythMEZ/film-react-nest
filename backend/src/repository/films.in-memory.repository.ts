import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FilmsRepository } from './films.repository';
import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { mapFilmToDto, mapScheduleToDto } from './film.mapper';

type FilmWithSchedule = Film & { schedule: Schedule[] };

@Injectable()
export class FilmsInMemoryRepository implements FilmsRepository {
  private readonly films: FilmWithSchedule[] = JSON.parse(
    readFileSync(
      join(__dirname, '..', '..', 'test', 'mongodb_initial_stub.json'),
      'utf-8'
    )
  );

  async findById(id: string): Promise<FilmDto | null> {
    const film = this.films.find((film) => film.id === id);
    return film ? mapFilmToDto(film) : null;
  }

  async findAll(): Promise<FilmDto[]> {
    return this.films.map(mapFilmToDto);
  }

  async findScheduleById(id: string): Promise<ScheduleDto[] | null> {
    const film = this.films.find((film) => film.id === id);
    return film ? film.schedule.map(mapScheduleToDto) : null;
  }

  async findSession(
    filmId: string,
    sessionId: string
  ): Promise<ScheduleDto | null> {
    const film = this.films.find((film) => film.id === filmId);
    const session = film?.schedule.find(
      (schedule) => schedule.id === sessionId
    );
    return session ? mapScheduleToDto(session) : null;
  }

  async addTakenSeats(
    filmId: string,
    sessionId: string,
    seats: string[]
  ): Promise<boolean> {
    const film = this.films.find((film) => film.id === filmId);
    const session = film?.schedule.find(
      (schedule) => schedule.id === sessionId
    );
    if (!session) return false;
    if (seats.some((seat) => session.taken.includes(seat))) return false;
    session.taken.push(...seats);
    return true;
  }

  async removeTakenSeats(
    filmId: string,
    sessionId: string,
    seats: string[]
  ): Promise<void> {
    const film = this.films.find((film) => film.id === filmId);
    const session = film?.schedule.find(
      (schedule) => schedule.id === sessionId
    );
    if (!session) return;
    session.taken = session.taken.filter((seat) => !seats.includes(seat));
  }
}
