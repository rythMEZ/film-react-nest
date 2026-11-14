import { Module } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FILMS_REPOSITORY } from '../repository/films.repository';
import { AppRepository } from '../repository/app.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Film, Schedule])],
  controllers: [FilmsController],
  providers: [
    FilmsService,
    {
      provide: FILMS_REPOSITORY,
      useClass: AppRepository,
    },
  ],
  exports: [FILMS_REPOSITORY],
})
export class FilmsModule {}
