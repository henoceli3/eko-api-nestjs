import { Injectable } from '@nestjs/common';
import { Alchemy, Network, Utils, Wallet } from 'alchemy-sdk';
import Web3 from 'web3';
import { RegisteredSubscription } from 'web3/lib/commonjs/eth.exports';

@Injectable()
export class TransactionsService {
  provider: string;
  apikey: string;
  web3: Web3<RegisteredSubscription>;
  alchemy: Alchemy;
  constructor() {
    this.apikey = process.env.ALCHEMY_API_KEY;
    this.provider = `https://eth-mainnet.g.alchemy.com/v2/${this.apikey}`;
    this.web3 = new Web3(this.provider);
    this.alchemy = new Alchemy({
      apiKey: this.apikey,
      network: Network.ETH_SEPOLIA, //TODO: Change this to the network you want to use
    });
  }

  async getEthereumGasPrice() {
    const gasPriceWei = await this.web3.eth.getGasPrice();
    const gasPriceGwei = this.web3.utils.fromWei(gasPriceWei, 'gwei');
    const gasPriceEthEquivalent = this.web3.utils.fromWei(gasPriceWei, 'ether');

    return {
      gasPriceWei: gasPriceWei.toString(),
      gasPriceGwei: gasPriceGwei.toString(),
      gasPriceEthEquivalent: gasPriceEthEquivalent.toString(),
    };
  }

  async sendEthereum(
    destinationAddress: string,
    amount: string,
    privateKey: string,
  ) {
    const wallet = new Wallet(privateKey);
    const nonce = await this.alchemy.core.getTransactionCount(
      wallet.address,
      'latest',
    );
    const transaction = {
      to: destinationAddress,
      value: Utils.parseEther(amount),
      gasLimit: '21000',
      maxPriorityFeePerGas: Utils.parseUnits('5', 'gwei'),
      maxFeePerGas: Utils.parseUnits('20', 'gwei'),
      nonce: nonce,
      type: 2,
      chainId: 11155111, //TODO: change this to the network id 1
    };
    const rawTransaction = await wallet.signTransaction(transaction);
    const tx = await this.alchemy.core.sendTransaction(rawTransaction);
    return { transactionHash: tx.hash };
  }
}
