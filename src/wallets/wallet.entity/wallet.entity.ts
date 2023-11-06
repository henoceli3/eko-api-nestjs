import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WalletEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  uuid: string;

  @Column({ nullable: false })
  userUuid: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  mnemonic: string;

  @Column({ nullable: false })
  isActive: boolean;

  @Column({ nullable: false })
  iv: string;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date;
}
