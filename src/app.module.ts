import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { AuthentificationModule } from './authentification/authentification.module';
import { TransactionsModule } from './transactions/transactions.module';
import * as dotenv from 'dotenv';
import { LoggerMiddleware } from './authentification/middleware/logger-middleware/logger-middleware';
dotenv.config();

const bdConfig: MysqlConnectionOptions = {
  type: 'mariadb',
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot(bdConfig),
    UsersModule,
    WalletsModule,
    AuthentificationModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
