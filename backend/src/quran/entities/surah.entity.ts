import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Surah {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  nameArabic!: string;

  @Column({ length: 100 })
  nameLatin!: string;

  @Column('int')
  totalAyah!: number;

  @Column({ default: new Date() })
  createdAt!: Date;
}

@Entity()
export class Ayah {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('int')
  surahId!: string;

  @Column('int')
  number!: number;

  @Column('text')
  textArabic!: string;

  @Column('text', { nullable: true })
  translation!: string | null;

  @Column({ nullable: true })
  audioUrl!: string | null;

  @Column({ default: new Date() })
  createdAt!: Date;
}