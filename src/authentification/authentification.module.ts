import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthentificationController } from './authentification.controller';
import { AuthentificationService } from './authentification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { body, param } from 'express-validator';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthentificationController],
  providers: [AuthentificationService, UsersService],
})
export class AuthentificationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        body('email').notEmpty().isEmail().trim().escape(),
        body('password').notEmpty().isString().escape(),
      )
      .forRoutes('authentification/login');
    consumer
      .apply(body('email').notEmpty().isEmail().escape())
      .forRoutes('authentification/forgotPassword');
    consumer
      .apply(
        body('password').notEmpty().isString().escape(),
        param('email').notEmpty().isEmail().escape(),
        param('token').notEmpty().isString().escape(),
      )
      .forRoutes('authentification/resetPassword/:email/:token');
    consumer
      .apply(
        body('twoFactorAuthenticationCode').notEmpty().isString().escape(),
        body('uuid').notEmpty().isString().escape(),
      )
      .forRoutes('authentification/2fa/turnOn');
    consumer
      .apply(
        body('twoFactorAuthenticationCode').notEmpty().isString().escape(),
        body('uuid').notEmpty().isString().escape(),
      )
      .forRoutes('authentification/2fa/turnOff');
    consumer
      .apply(
        body('twoFactorAuthenticationCode').notEmpty().isString().escape(),
        body('uuid').notEmpty().isString().escape(),
      )
      .forRoutes('authentification/2fa/verify');
  }
}
