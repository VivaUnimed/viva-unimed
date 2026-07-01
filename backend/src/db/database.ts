import { Sequelize } from 'sequelize-typescript';
import { Config } from '../config';
import UserModel from './models/user.model';
import { QueryTypes, TransactionOptions } from 'sequelize';

export class Database {
  private sequelize!: Sequelize;
  private config!: Config;
  constructor() {

  }

  async start(config: Config) {
    this.config = config;
    this.sequelize = new Sequelize({
      database: config.DB_DATABASE,
      dialect: 'postgres',
      username: config.DB_USERNAME,
      password: config.DB_PASSWORD,
      host: config.DB_ADDRESS,
      port: config.DB_PORT,
      models: [__dirname + '/models'],
      logging: false,
      pool: {
        max: 30,
      },
      dialectOptions: {
        ssl: config.DB_ENABLE_SSL ? {
          require: config.DB_ENABLE_SSL,
          rejectUnauthorized: false,
        } : undefined,
      },
    });
    await this.createDatabaseIfNotExists();
    await this.testConnection();
    await this.migrate();
    await UserModel.findAll();
  }

  private async createDatabaseIfNotExists() {
    const sql = new Sequelize({
      database: 'postgres',
      dialect: 'postgres',
      username: this.config.DB_USERNAME,
      password: this.config.DB_PASSWORD,
      host: this.config.DB_ADDRESS,
      port: this.config.DB_PORT,
      logging: false,
      dialectOptions: {
        ssl: this.config.DB_ENABLE_SSL ? {
          require: this.config.DB_ENABLE_SSL,
          rejectUnauthorized: false,
        } : undefined,
      },
    });
    try {
      const result = await sql.query(
        `SELECT 1 FROM pg_database WHERE datname = :dbName`,
        {
          replacements: { dbName: this.config.DB_DATABASE },
          type: QueryTypes.SELECT,
        }
      );

      if (result.length === 0) {
        await sql.query(`CREATE DATABASE "${this.config.DB_DATABASE}"`);
        console.log(`Database "${this.config.DB_DATABASE}" created.`);
      } else {
        console.log(`Database "${this.config.DB_DATABASE}" already exists.`);
      }
    } catch (e) {
      // skip error
    } finally {
      await sql.close();
    }
  }

  transaction(options?: TransactionOptions) {
    return this.sequelize.transaction(options);
  }

  private async migrate() {
    // TODO: Implementar migrações
    await this.sequelize.sync({ alter: true });
  }

  private async testConnection() {
    await this.sequelize.query('SELECT 1');
  }

  async stop() {
    await this.sequelize.close();
  }
}
