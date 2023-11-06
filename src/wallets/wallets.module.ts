import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletEntity } from './wallet.entity/wallet.entity';
import { UserEntity } from 'src/users/user.entity/user.entity';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletEntity]),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [WalletsService, UsersService],
  controllers: [WalletsController],
})
export class WalletsModule {}
