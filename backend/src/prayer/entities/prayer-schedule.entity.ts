import { Entity, PrimaryGeneratedColumn, Column, UUIDColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class PrayerSchedule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  scheduleDate!: string; // Format: YYYY-MM-DD

  @Column({ type: 'time' })
  fajr!: Date;

  @Column({ type: 'time' })
  dhuhr!: Date;

  @Column({ type: 'time' })
  asr!: Date;

  @Column({ type: 'time' })
  maghrib!: Date;

  @Column({ type: 'time' })
  isha!: Date;

  @Column('float')
  latitude!: number;

  @Column('float')
  longitude!: number;

  @Column()
  method!: string; // e.g., 'Muslim World League', 'Egyptian', etc.

  @Column({ default: new Date() })
  createdAt!: Date;
}