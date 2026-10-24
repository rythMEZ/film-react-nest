import { Module } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FILMS_REPOSITORY } from '../repository/films.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmSchema } from './film.schema';
import { FilmsMongoRepository } from '../repository/films.mongo.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Film', schema: FilmSchema }])],
  controllers: [FilmsController],
  providers: [
    FilmsService,
    {
      provide: FILMS_REPOSITORY,
      useClass: FilmsMongoRepository,
    },
  ],
  exports: [FILMS_REPOSITORY],
})
export class FilmsModule {}
