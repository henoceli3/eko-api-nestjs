import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from './wallet.entity/wallet.entity';
import { UserEntity } from 'src/users/user.entity/user.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bip39 from 'bip39';
import * as bcrypt from 'bcrypt';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { Wallet } from 'ethers';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(WalletEntity)
    private walletsRepository: Repository<WalletEntity>,

    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  generateMnemonic(bits: number) {
    return bip39.generateMnemonic(bits);
  }

  async encrypt(content: string) {
    const iv = randomBytes(16);
    const password = process.env.ENCRYPTED_PASSWORD;
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const encryptedText = Buffer.concat([
      cipher.update(content),
      cipher.final(),
    ]);
    return {
      message: 'encrypted',
      data: { iv: iv.toString('hex'), content: encryptedText.toString('hex') },
    };
  }

  async decrypt(iv: string, content: string) {
    const password = process.env.ENCRYPTED_PASSWORD;
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    const decipher = createCipheriv('aes-256-ctr', key, Buffer.from(iv, 'hex'));
    const decryptedText = Buffer.concat([
      decipher.update(Buffer.from(content, 'hex')),
      decipher.final(),
    ]);
    return decryptedText.toString();
  }

  async createWallet(mnemonic: string, name: string, userUuid: string) {
    const existWallet = await this.walletsRepository.exist({
      where: { mnemonic: mnemonic.trim() },
    });
    if (existWallet) {
      throw new NotFoundException('Wallet already exists');
    }
    const crypt = await this.encrypt(mnemonic);
    const walletCreated = await this.walletsRepository.save({
      uuid: uuidv4(),
      userUuid: userUuid,
      name: name.trim(),
      mnemonic: crypt.data.content,
      iv: crypt.data.iv,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      message: 'Wallet created',
      data: { uuid: walletCreated.uuid },
    };
  }

  async updateWalletName(uuid: string, name: string) {
    const existWallet = await this.walletsRepository.exist({
      where: { uuid: uuid.trim(), isActive: true },
    });
    if (!existWallet) {
      throw new NotFoundException('Wallet not found');
    }
    await this.walletsRepository.update(
      { uuid: uuid.trim() },
      { name: name.trim(), updatedAt: new Date() },
    );
    return {
      message: 'Wallet name updated',
      data: {},
    };
  }

  async deleteWallet(uuid: string, userUuid: string, password: string) {
    const existWallet = await this.walletsRepository.exist({
      where: { uuid: uuid, isActive: true },
    });
    if (!existWallet) {
      throw new NotFoundException('Wallet not found');
    }
    const existUser = await this.usersRepository.findOne({
      select: ['password'],
      where: { uuid: userUuid.trim(), isActive: true },
    });
    if (!existUser) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      password.trim(),
      existUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    await this.walletsRepository.update(
      { uuid: uuid.trim() },
      { isActive: false, deletedAt: new Date() },
    );
    return {
      message: 'Wallet deleted',
      data: {},
    };
  }

  async getAllWalletsByUserUuid(userUuid: string) {
    const wallets = await this.walletsRepository.find({
      select: ['uuid', 'name', 'mnemonic', 'iv'],
      where: { userUuid: userUuid.trim(), isActive: true },
    });
    const decrypWallet = wallets.map(async (wallet) => {
      return {
        uuid: wallet.uuid,
        name: wallet.name,
        mnemonic: await this.decrypt(wallet.iv, wallet.mnemonic),
      };
    });
    return {
      message: 'Wallets found',
      data: await Promise.all(decrypWallet),
    };
  }

  generateEthereumAddresses(mnemonic: string) {
    const ethereumWallet = Wallet.fromPhrase(mnemonic);
    return {
      publicKey: ethereumWallet.publicKey,
      privateKey: ethereumWallet.privateKey,
      address: ethereumWallet.address,
    };
  }
}
