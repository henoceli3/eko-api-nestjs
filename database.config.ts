import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export const bdConfig: MysqlConnectionOptions = {
  type: 'mariadb',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'eko-api-nestjs',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
};
