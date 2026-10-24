import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FILMS_REPOSITORY,
  FilmsRepository,
} from '../repository/films.repository';
import { FilmDto, ScheduleDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository
  ) {}

  findAll(): Promise<FilmDto[]> {
    return this.filmsRepository.findAll();
  }

  async findScheduleById(id: string): Promise<ScheduleDto[]> {
    const schedule = await this.filmsRepository.findScheduleById(id);
    if (!schedule) throw new NotFoundException('Фильм не найден');
    return schedule;
  }
}
