import { Sequelize } from 'sequelize-typescript';
import { Config } from '../config';
import UserModel from './models/user.model';
import { TransactionOptions } from 'sequelize';

export class Database {
  private sequelize!: Sequelize;
  constructor() {

  }

  async start(config: Config) {
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
    });
    await this.testConnection();
    await this.migrate();
    await UserModel.findAll();
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
