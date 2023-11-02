import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      message: 'Eko Api Nestjs',
      version: '1.0.0',
    };
  }
}
