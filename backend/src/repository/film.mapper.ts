import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { FilmWithSchedule } from '../films/film.schema';
import { Schedule } from '../films/entities/schedule.entity';

export function mapScheduleToDto(schedule: Schedule): ScheduleDto {
  return {
    id: schedule.id,
    daytime: schedule.daytime,
    hall: `${schedule.hall}`,
    rows: schedule.rows,
    seats: schedule.seats,
    price: schedule.price,
    taken: [...schedule.taken],
  };
}

export function mapFilmToDto(film: FilmWithSchedule): FilmDto {
  return {
    id: film.id,
    rating: film.rating,
    director: film.director,
    tags: [...film.tags],
    title: film.title,
    about: film.about,
    description: film.description,
    image: film.image,
    cover: film.cover,
  };
}
