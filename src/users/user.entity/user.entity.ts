import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true, nullable: false })
  uuid?: string;

  @Column({ unique: true, nullable: false })
  apiKey?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: false, length: 100 })
  name: string;

  @Column({ nullable: false, length: 100 })
  lastName: string;

  @Column({ nullable: false, length: 100, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  isActive?: boolean;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ nullable: false })
  createdAt?: Date;

  @Column({ nullable: false })
  updatedAt?: Date;

  @Column({ nullable: true })
  deletedAt?: Date;

  @Column({ nullable: true })
  twoFactorAuthSecret?: string;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({ default: false })
  acceptedTerms: boolean;
}
