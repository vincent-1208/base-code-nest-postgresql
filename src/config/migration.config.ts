import { DataSource } from 'typeorm';
import 'dotenv/config';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '1433', 10) || 1433,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DB_NAME,
  dropSchema: false,
  synchronize: false,
  logging: false,
  logger: 'advanced-console',
  entities: ['src/**/**.entity{.ts,.js}'],
  subscribers: ['dist/**/**.subscriber{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
});
