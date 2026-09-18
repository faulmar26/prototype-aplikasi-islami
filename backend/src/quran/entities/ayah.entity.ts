import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Surah } from './surah.entity';

@Entity()
export class AyahDetail {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('int')
  surahId!: number;

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