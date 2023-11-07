import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthentificationController } from './authentification.controller';
import { AuthentificationService } from './authentification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { LoggerMiddleware } from './middleware/logger-middleware/logger-middleware';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthentificationController],
  providers: [AuthentificationService, UsersService],
})
export class AuthentificationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
