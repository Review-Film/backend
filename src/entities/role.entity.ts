import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Roles {
  ADMIN = 'admin',
  MEMBER = 'member',
  SYSTEMADMIN = 'systemadmin',
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.MEMBER,
    unique: true,
  })
  name: string;
}
