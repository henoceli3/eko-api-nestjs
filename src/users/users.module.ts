import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity/user.entity';
import { body } from 'express-validator';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        body('name').notEmpty().isString().escape(),
        body('lastName').notEmpty().isString().escape(),
        body('email').isEmail().normalizeEmail().escape(),
        body('password').notEmpty().isString().escape(),
      )
      .forRoutes('users/createUser');
    consumer
      .apply(body('uuid').notEmpty().isString().escape())
      .forRoutes('users/getUserByUuid');
    consumer
      .apply(
        body('uuid').notEmpty().isString().escape(),
        body('name').notEmpty().isString().escape(),
        body('lastName').notEmpty().isString().escape(),
        body('password').notEmpty().isString().escape(),
      )
      .forRoutes('users/updateNameAndLastName');
    consumer
      .apply(
        body('uuid').notEmpty().isString().escape(),
        body('password').notEmpty().isString().escape(),
      )
      .forRoutes('users/deleteUser');
  }
}
