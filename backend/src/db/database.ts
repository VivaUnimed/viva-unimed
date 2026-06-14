import { Sequelize } from 'sequelize-typescript';
import { Config } from '../config';
import UserModel from './models/user.model';
import { TransactionOptions } from 'sequelize';

export class Database {
  private sequelize!: Sequelize;
  constructor() {

  }

  async start(config: Config) {
    // Link do Neon abaixo
    // @ts-ignore
    this.sequelize = new Sequelize('postgresql://neondb_owner:npg_IvjpJiz8mk1H@ep-lucky-fog-acpq2ep5-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', {
      dialect: 'postgres',
      models: [__dirname + '/models'],
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Configuração obrigatória para o Neon.tech
        }
      },
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