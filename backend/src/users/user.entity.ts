import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, ManyToOne, JoinColumn } from 'typeorm';
import { BeforeHook } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  password!: string;

  @Column({ default: 'Muslim World League' })
  calculationMethod!: string;

  @Column({ default: 'Jakarta' })
  defaultLocation!: string;

  @Column({ default: new Date() })
  createdAt!: Date;

  @BeforeInsert()
  async hashPassword() {
    // Password hashing will be done in service
  }
}