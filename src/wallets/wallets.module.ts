import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletEntity } from './wallet.entity/wallet.entity';
import { UserEntity } from 'src/users/user.entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { body } from 'express-validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletEntity]),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [WalletsService, UsersService],
  controllers: [WalletsController],
})
export class WalletsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        body('name').notEmpty().isString().escape(),
        body('userUuid').notEmpty().isString().escape(),
      )
      .forRoutes('wallets/createWallet');
    consumer
      .apply(
        body('name').notEmpty().isString().escape(),
        body('userUuid').notEmpty().isString().escape(),
      )
      .forRoutes('wallets/updateWalletName');
    consumer
      .apply(
        body('uuid').notEmpty().isString().escape(),
        body('userUuid').notEmpty().isString().escape(),
        body('password').notEmpty().isString().escape(),
      )
      .forRoutes('wallets/deleteWallet');
    consumer
      .apply(body('userUuid').notEmpty().isString().escape())
      .forRoutes('getAllWalletsByUserUuid');
    consumer
      .apply(body('mnemonic').notEmpty().isString().escape())
      .forRoutes('authentification/generateEthereumWallet');
  }
}
