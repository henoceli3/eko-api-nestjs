import { Body, Controller, Delete, HttpCode, Post } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletEntity } from './wallet.entity/wallet.entity';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/user.entity/user.entity';

@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly service: WalletsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('create')
  @HttpCode(200)
  async createWallet(@Body('wallet') wallet: WalletEntity) {
    const mnemonic = this.service.generateMnemonic(128);
    wallet.mnemonic = mnemonic;
    return this.service.createWallet(wallet);
  }

  @Post('updateName')
  @HttpCode(200)
  async updateWalletName(@Body('wallet') wallet: WalletEntity) {
    return this.service.updateWalletName(wallet);
  }

  @Delete('delete')
  @HttpCode(200)
  async deleteWallet(
    @Body('wallet') wallet: WalletEntity,
    @Body('user') user: UserEntity,
  ) {
    return this.service.deleteWallet(wallet, user);
  }

  @Post('getAllByUserUuid')
  @HttpCode(200)
  async getAllWalletsByUserUuid(@Body('wallet') wallet: WalletEntity) {
    return this.service.getAllWalletsByUserUuid(wallet);
  }

  @Post('generateEthereumAddresses')
  @HttpCode(200)
  async generateEthereumWallet(@Body('mnemonic') mnemonic: string) {
    return this.service.generateEthereumAddresses(mnemonic);
  }
}
