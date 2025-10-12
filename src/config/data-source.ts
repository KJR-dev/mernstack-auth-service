import 'reflect-metadata';
import path from 'node:path';
import { DataSource } from 'typeorm';
import { Config } from './index';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: Config.POSTGRESQL_HOST,
    port: Number(Config.POSTGRESQL_PORT),
    username: Config.POSTGRESQL_USERNAME,
    password: Config.POSTGRESQL_PASSWORD,
    database: Config.POSTGRESQL_DATABASE,
    // synchronize:
    //     Config.NODE_ENV === 'test' || Config.NODE_ENV === 'development',
    synchronize: false,
    logging: false,
    entities: [path.join(__dirname, '../entity/*.{ts,js}')], // ✅ Auto-adjusts
    migrations: [path.join(__dirname, '../migration/*.{ts,js}')],
    subscribers: [],
});
