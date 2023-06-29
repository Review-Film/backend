import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinTable,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './index';
import { Topic } from './topic.entity';

export enum Visibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  withLink = 'withLink',
}

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public url: string;

  @Column()
  public title: string;

  @Column()
  public image: string;

  @Column()
  public description: string;

  @Column()
  content: string;

  @Column()
  public timeToRead: string;

  @Column({
    type: 'enum',
    enum: Visibility,
    default: Visibility.PRIVATE,
  })
  public visibility: string;

  @Column('boolean', { default: false })
  public deleteSoft: boolean;

  @ManyToMany(() => Topic)
  @JoinTable({
    name: 'article_topic',
    joinColumn: {
      name: 'article',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'topic',
      referencedColumnName: 'id',
    },
  })
  topics: Topic[];

  @ManyToOne(() => User, (user: User) => user.articles)
  public createdBy: User;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updatedAt: Date;
}
