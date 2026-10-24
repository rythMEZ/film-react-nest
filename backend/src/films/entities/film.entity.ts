import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity('films')
export class Film {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'double precision' })
  rating: number;

  @Column({ type: 'character varying' })
  director: string;

  @Column({ type: 'simple-array' })
  tags: string[];

  @Column({ type: 'character varying' })
  image: string;

  @Column({ type: 'character varying' })
  cover: string;

  @Column({ type: 'character varying' })
  title: string;

  @Column({ type: 'character varying' })
  about: string;

  @Column({ type: 'character varying' })
  description: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film)
  schedule: Schedule[];
}
