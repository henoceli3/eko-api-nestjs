import { Body, Controller, Get, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get('getEthereumGasPrice')
  async getEthereumGasPrice() {
    return await this.service.getEthereumGasPrice();
  }

  @Post('sendEthereum')
  async sendEthereum(
    @Body('destinationAddress') destinationAddress: string,
    @Body('amount') amount: string,
    @Body('privateKey') privateKey: string,
  ) {
    return await this.service.sendEthereum(
      destinationAddress,
      amount,
      privateKey,
    );
  }
}
