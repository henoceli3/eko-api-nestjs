import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WalletEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  uuid: string;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false, length: 100 })
  name: string;

  @Column({ nullable: false, length: 100 })
  mnemonic: string;

  @Column({ nullable: false })
  isActive: boolean;
}
