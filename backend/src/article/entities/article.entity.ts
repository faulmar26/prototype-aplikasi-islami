import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 255, unique: true })
  slug!: string;

  @Column('text')
  content!: string;

  @Column()
  authorId!: string;

  @Column({ length: 20, default: 'draft' })
  status!: string; // draft, published

  @Column({ type: 'timestamp', nullable: true })
  publishedAt!: Date | null;

  @Column({ default: new Date() })
  createdAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author!: User;
}