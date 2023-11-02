import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { bdConfig } from 'database.config';

@Module({
  imports: [TypeOrmModule.forRoot(bdConfig), UsersModule, WalletsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
