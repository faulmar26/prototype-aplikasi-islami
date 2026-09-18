import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  title!: string;

  @Column({ length: 50 })
  type!: string; // e.g., 'prayer', 'read_quran', 'daily_login'

  @Column('int')
  targetCount!: number; // Target count to complete

  @Column('int')
  rewardPoints!: number; // Points reward for completion

  @Column({ default: true })
  isDaily!: boolean;

  @Column({ default: new Date() })
  createdAt!: Date;
}

@Entity()
export class UserMissionProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  missionId!: string;

  @Column('int', { default: 0 })
  currentCount!: number;

  @Column({ default: false })
  isCompleted!: boolean;

  @Column({ type: 'date' })
  progressDate!: Date;

  @Column({ default: new Date() })
  createdAt!: Date;
}

@Entity()
export class Streak {
  @PrimaryColumn('uuid')
  userId!: string;

  @Column('int', { default: 0 })
  currentStreak!: number;

  @Column('int', { default: 0 })
  longestStreak!: number;

  @Column({ type: 'date' })
  lastActiveDate!: Date;

  @Column({ default: new Date() })
  updatedAt!: Date;
}