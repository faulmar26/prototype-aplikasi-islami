import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class DoaCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ default: new Date() })
  createdAt!: Date;
}

@Entity()
export class Doa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  categoryId!: string;

  @Column('text')
  textArabic!: string;

  @Column('text')
  latin!: string;

  @Column('text')
  translation!: string;

  @Column({ default: new Date() })
  createdAt!: Date;
}