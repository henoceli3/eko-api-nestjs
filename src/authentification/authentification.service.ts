import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity/user.entity';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { Options } from 'nodemailer/lib/mailer';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthentificationService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

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

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      select: [
        'uuid',
        'email',
        'password',
        'isTwoFactorEnabled',
        'acceptedTerms',
      ],
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
        data: {
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          acceptedTerms: user.acceptedTerms,
          uuid: user.uuid,
          token: token,
        },
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

        data: {
          uuid: user.uuid,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
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
    const resetLink = `http://localhost:${process.env.PORT}/authentification/resetPassword/${user.email}/${token}`;
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
    this.sentMail({
      from: 'Eko Wallet <helitako16@gmail.com>',
      to: email,
      subject: 'Mot de passe réinitialisé',
      text: `Mot de passe réinitialisé avec succès`,
    });
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
