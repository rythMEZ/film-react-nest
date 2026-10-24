import { FilmDto, ScheduleDto } from '../films/dto/films.dto';

export const FILMS_REPOSITORY = Symbol('FILMS_REPOSITORY');

export interface FilmsRepository {
  findById(id: string): Promise<FilmDto>;
  findAll(): Promise<FilmDto[]>;
  findScheduleById(id: string): Promise<ScheduleDto[] | null>;
  findSession(filmId: string, sessionId: string): Promise<ScheduleDto | null>;
  addTakenSeats(
    filmId: string,
    sessionId: string,
    seats: string[]
  ): Promise<boolean>;
  removeTakenSeats(
    filmId: string,
    sessionId: string,
    seats: string[]
  ): Promise<void>;
}
