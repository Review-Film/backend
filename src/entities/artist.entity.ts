import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ArtistType {
  DIRECTOR = 'director',
  WRITER = 'writer',
  ACTOR = 'actor',
}

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: ArtistType,
    array: true,
    default: [],
  })
  type: ArtistType[];
}
