import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { FilmsRepository } from './films.repository';
import { InjectModel } from '@nestjs/mongoose';
import { FilmDocument } from '../films/film.schema';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { mapFilmToDto, mapScheduleToDto } from './film.mapper';

@Injectable()
export class FilmsMongoRepository implements FilmsRepository {
  constructor(
    @InjectModel('Film') private readonly filmModel: Model<FilmDocument>
  ) {}

  async findById(id: string): Promise<FilmDto | null> {
    const film = await this.filmModel.findOne({ id }).lean().exec();
    return film ? mapFilmToDto(film) : null;
  }

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmModel.find().lean().exec();
    return films.map(mapFilmToDto);
  }

  async findScheduleById(id: string): Promise<ScheduleDto[] | null> {
    const film = await this.filmModel.findOne({ id }).lean().exec();
    return film ? film.schedule.map(mapScheduleToDto) : null;
  }

  async findSession(
    filmId: string,
    sessionId: string
  ): Promise<ScheduleDto | null> {
    const film = await this.filmModel
      .findOne({ id: filmId, 'schedule.id': sessionId })
      .lean()
      .exec();
    const session = film?.schedule.find((item) => item.id === sessionId);
    return session ? mapScheduleToDto(session) : null;
  }

  async addTakenSeats(
    filmId: string,
    sessionId: string,
    seats: string[]
  ): Promise<boolean> {
    const result = await this.filmModel
      .findOneAndUpdate(
        {
          id: filmId,
          schedule: {
            $elemMatch: { id: sessionId, taken: { $nin: seats } },
          },
        },
        { $push: { 'schedule.$[session].taken': { $each: seats } } },
        { arrayFilters: [{ 'session.id': sessionId }], new: true }
      )
      .lean()
      .exec();
    return result !== null;
  }

  async removeTakenSeats(
    filmId: string,
    sessionId: string,
    seats: string[]
  ): Promise<void> {
    await this.filmModel
      .updateOne(
        { id: filmId },
        { $pull: { 'schedule.$[session].taken': { $in: seats } } },
        { arrayFilters: [{ 'session.id': sessionId }] }
      )
      .exec();
  }
}
