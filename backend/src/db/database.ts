import { Sequelize } from 'sequelize-typescript';
import { Config } from '../config';
import UserModel from './models/user.model';

export class Database {
  private sequelize!: Sequelize;
  constructor(private config: Config) {

  }

  async start() {
    this.sequelize = new Sequelize({
      database: this.config.DB_DATABASE,
      dialect: 'postgres',
      username: this.config.DB_USERNAME,
      password: this.config.DB_PASSWORD,
      host: this.config.DB_ADDRESS,
      port: this.config.DB_PORT,
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
