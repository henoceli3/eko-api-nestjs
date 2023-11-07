import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthentificationService } from './authentification.service';
import { UsersService } from 'src/users/users.service';

@Controller('authentification')
export class AuthentificationController {
  constructor(
    private readonly service: AuthentificationService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(200)
  login(@Body('email') email: string, @Body('password') password: string) {
    return this.service.login(email, password);
  }

  @Post('forgotPassword')
  @HttpCode(200)
  forgotPassword(@Body('email') email: string) {
    return this.service.forgotPassword(email);
  }

  @Post('resetPassword/:email/:token')
  @HttpCode(200)
  resetPassword(
    @Param('email') email: string,
    @Param('token') token: string,
    @Body('password') password: string,
  ) {
    return this.service.resetPassword(email, token, password);
  }

  @Post('2fa/generate')
  @HttpCode(200)
  async generateTwoFactorAuthenticationSecret(@Body('uuid') uuid: string) {
    await this.service.generateTwoFactorAuthenticationSecret(uuid);
    const otp = await this.service.generateTwoFactorAuthenticationCode(uuid);
    this.service.sentMail({
      from: 'Eko Wallet <helitako16@gmail.com>',
      to: (await this.usersService.getUserByUuid(uuid)).data.email,
      subject: 'Authentication code',
      text: `Authentication code: ${otp.data}`,
    });
    return {
      message: 'Authentication code sent',
      data: {},
    };
  }

  @Post('2fa/turnOn')
  @HttpCode(200)
  async turnOnTwoFactorAuthentication(
    @Body('twoFactorAuthenticationCode') twoFactorAuthenticationCode: string,
    @Body('uuid') uuid: string,
  ) {
    const isCodeValid = this.service.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      uuid,
    );
    if ((await isCodeValid) === false) {
      throw new UnauthorizedException('Wrong authentication code');
    } else {
      return this.service.turnOnTwoFactorAuthentication(uuid);
    }
  }

  @Post('2fa/turnOff')
  @HttpCode(200)
  async turnOffTwoFactorAuthentication(
    @Body('twoFactorAuthenticationCode') twoFactorAuthenticationCode: string,
    @Body('uuid') uuid: string,
  ) {
    const isCodeValid = this.service.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      uuid,
    );
    if ((await isCodeValid) === false) {
      throw new UnauthorizedException('Wrong authentication code');
    } else {
      return this.service.turnOffTwoFactorAuthentication(uuid);
    }
  }

  @Post('2fa/verify')
  @HttpCode(200)
  async verifyTwoFactorAuthentication(
    @Body('twoFactorAuthenticationCode') twoFactorAuthenticationCode: string,
    @Body('uuid') uuid: string,
  ) {
    const isCodeValid = this.service.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      uuid,
    );
    if ((await isCodeValid) === false) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    return {
      message: 'Two factor authentication verified',
      data: {
        result: await isCodeValid,
      },
    };
  }
}
