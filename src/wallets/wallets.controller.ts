import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { UsersService } from 'src/users/users.service';
import { validationResult } from 'express-validator';

@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly service: WalletsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('createWallet')
  @HttpCode(200)
  async createWallet(@Body('name') name: string, userUuid: string) {
    const mnemonic = this.service.generateMnemonic(128);
    return this.service.createWallet(mnemonic, name, userUuid);
  }

  @Post('updateWalletName')
  @HttpCode(200)
  async updateWalletName(
    @Body('name') name: string,
    @Body('uuid') uuid: string,
    @Req() request: Request,
  ) {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      throw new BadRequestException(result);
    }
    return this.service.updateWalletName(name, uuid);
  }

  @Delete('deleteWallet')
  @HttpCode(200)
  async deleteWallet(
    @Body('uuid') uuid: string,
    @Body('userUuid') userUuid: string,
    @Body('password') password: string,
  ) {
    return this.service.deleteWallet(uuid, userUuid, password);
  }

  @Post('getAllWalletsByUserUuid')
  @HttpCode(200)
  async getAllWalletsByUserUuid(@Body('userUuid') userUuid: string) {
    return this.service.getAllWalletsByUserUuid(userUuid);
  }

  @Post('generateEthereumAddresses')
  @HttpCode(200)
  async generateEthereumWallet(@Body('mnemonic') mnemonic: string) {
    return this.service.generateEthereumAddresses(mnemonic);
  }
}
