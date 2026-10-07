import { HydratedDocument, Schema } from 'mongoose';

import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';

export interface FilmWithSchedule extends Film {
  schedule: Schedule[];
}

export type FilmDocument = HydratedDocument<FilmWithSchedule>;

export const ScheduleSchema = new Schema<Schedule>(
  {
    id: { type: String, required: true },
    daytime: { type: String, required: true },
    hall: { type: Number, required: true },
    rows: { type: Number, required: true },
    seats: { type: Number, required: true },
    price: { type: Number, required: true },
    taken: { type: [String], default: [] },
  },
  { _id: false, versionKey: false }
);

export const FilmSchema = new Schema<FilmWithSchedule>(
  {
    id: { type: String, required: true, unique: true },
    rating: { type: Number, required: true },
    director: { type: String, required: true },
    tags: { type: [String], default: [] },
    title: { type: String, required: true },
    about: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    cover: { type: String, required: true },
    schedule: { type: [ScheduleSchema], default: [] },
  },
  { versionKey: false }
);
