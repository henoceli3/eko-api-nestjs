import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { Options } from 'nodemailer/lib/mailer';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async createUser(user: UserEntity) {
    const existEmail = await this.usersRepository.findOne({
      where: { email: user.email },
    });
    if (existEmail) {
      throw new NotFoundException('Email already exists');
    }
    const salt = await bcrypt.genSalt();
    const password = user.password || '123456';
    const hashPassword = await bcrypt.hash(password, salt);
    const userCreated = this.usersRepository.save({
      uuid: uuidv4(),
      name: user.name.toLowerCase(),
      lastName: user.lastName.toLowerCase(),
      email: user.email.toLowerCase(),
      password: hashPassword,
      isActive: true,
      resetToken: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return {
      message: 'User created',
      data: { uuid: (await userCreated).uuid },
    };
  }

  async getUserByUuid(uuid: string) {
    const user = await this.usersRepository.findOne({
      select: ['uuid', 'email', 'name', 'lastName', 'createdAt', 'updatedAt'],
      where: { uuid: uuid, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User found', data: user };
  }

  async getAllUsers() {
    const users = await this.usersRepository.find({
      select: ['uuid', 'email', 'name', 'lastName', 'createdAt', 'updatedAt'],
      where: { isActive: true },
    });
    return {
      message: 'Users found',
      data: users,
    };
  }

  async updateNameAndLastName(
    uuid: string,
    name: string,
    lastName: string,
    password: string,
  ) {
    const user = await this.usersRepository.findOne({
      select: ['name', 'lastName', 'password', 'updatedAt'],
      where: { uuid: uuid.trim(), isActive: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      password.trim(),
      user.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }
    await this.usersRepository.update(
      { uuid: uuid.trim() },
      {
        name: name.toLowerCase(),
        lastName: lastName.toLowerCase(),
        updatedAt: new Date(),
      },
    );
    return {
      message: 'User updated',
      data: {},
    };
  }

  async deleteUser(uuid: string, password: string) {
    const user = await this.usersRepository.findOne({
      select: ['password', 'isActive'],
      where: { uuid: uuid, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      password.trim(),
      user.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }
    await this.usersRepository.update(
      { uuid: uuid.trim() },
      { isActive: false, deletedAt: new Date() },
    );
    return {
      message: 'User deleted',
      data: {},
    };
  }

  async sentMail(mailOptions: Options) {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.STMP_USER,
        pass: process.env.STMP_PASS,
      },
    });
    transport.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      select: ['uuid', 'email', 'password', 'isTwoFactorEnabled'],
      where: { email: email, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    if (!user.isTwoFactorEnabled) {
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
      return {
        message: 'User logged in',
        isTwoFactorEnabled: false,
        data: {
          uuid: user.uuid,
        },
        token: token,
      };
    } else {
      const otp = await this.generateTwoFactorAuthenticationCode(user.uuid);
      this.sentMail({
        from: 'Eko Wallet <helitako16@gmail.com>',
        to: user.email,
        subject: 'Authentication code',
        text: `Authentication code: ${otp.data}`,
      });
      return {
        message: 'awaiting authentication code',
        isTwoFactorEnabled: true,
        data: {
          uuid: user.uuid,
        },
      };
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepository.findOne({
      select: ['uuid', 'email'],
      where: { email: email, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
    const resetLink = `http://localhost:${process.env.PORT}/users/resetPassword/${user.email}/${token}`;
    const mailOptions = {
      from: 'Eko Wallet <helitako16@gmail.com>',
      to: email,
      subject: 'Réinitialisation du mot de passe',
      text: `ouvrez l'adresse suivante pour changer votre mot de passe: ${resetLink}`,
    };
    await this.sentMail(mailOptions);
    await this.usersRepository.update(
      { uuid: user.uuid },
      { resetToken: token },
    );
    return {
      message: 'Email sent',
      data: {},
    };
  }

  async resetPassword(email: string, token: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { email: email.trim(), resetToken: token.trim(), isActive: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.usersRepository.update(
      { uuid: user.uuid },
      { password: hashedPassword, resetToken: '' },
    );
    return {
      message: 'Password updated',
      data: {},
    };
  }

  async setTwoFactorAuthenticationSecret(uuid: string, secret: string) {
    await this.usersRepository.update(
      { uuid: uuid },
      { twoFactorAuthSecret: secret },
    );
  }

  async turnOnTwoFactorAuthentication(uuid: string) {
    await this.usersRepository.update(
      { uuid: uuid },
      { isTwoFactorEnabled: true },
    );
    return {
      message: 'Two factor authentication enabled',
      data: {},
    };
  }

  async turnOffTwoFactorAuthentication(uuid: string) {
    await this.usersRepository.update(
      { uuid: uuid },
      { isTwoFactorEnabled: false },
    );
    return {
      message: 'Two factor authentication disabled',
      data: {},
    };
  }

  async generateTwoFactorAuthenticationSecret(uuid: string) {
    const secret = authenticator.generateSecret();
    await this.setTwoFactorAuthenticationSecret(uuid, secret);
    return {
      message: 'Two factor authentication secret generated',
      data: {},
    };
  }

  async generateTwoFactorAuthenticationCode(uuid: string) {
    const user = await this.usersRepository.findOne({
      select: ['twoFactorAuthSecret'],
      where: { uuid: uuid, isActive: true },
    });
    const otp = authenticator;
    otp.options = {
      digits: 6,
      step: 120,
      window: 1,
    };
    const code = otp.generate(user.twoFactorAuthSecret);
    return {
      message: 'Two factor authentication code generated',
      data: code,
    };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    const qrCodeDataURL = toDataURL(otpAuthUrl);
    return {
      message: 'Qr code generated',
      data: qrCodeDataURL,
    };
  }

  async isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    uuid: string,
  ) {
    const user = this.usersRepository.findOne({
      select: ['twoFactorAuthSecret'],
      where: { uuid: uuid, isActive: true },
    });
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: (await user).twoFactorAuthSecret,
    });
  }
}
