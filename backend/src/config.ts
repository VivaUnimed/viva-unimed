import joi from "joi";
import { config } from "dotenv";

export interface IConfig {
  SERVER_PORT: number;
  DB_ADDRESS: string;
  DB_PORT: number;
  DB_PASSWORD: string;
  DB_USERNAME: string;
  DB_DATABASE: string;
  JWT_SECRET: string;
  /** https://crontab.guru/#0/5_8-20_*_*_1-5 */
  APPOINTMENT_JOB_CRON: string;
  DEFAULT_ADMIN_EMAIL?: string;
  DEFAULT_ADMIN_PASSWORD?: string;
}

export interface Config extends IConfig {}
export class Config implements IConfig{
  private constructor(data: IConfig) {
    Object.assign(this, data);
  }

  static create(data: Partial<IConfig>): Config {
    const { error, value } = Config.Schema.validate(data, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      throw error;
    }
    return new Config(value);
  }

  /**
   * carrega configurações do arquivo .env na raiz do projeto
   */
  static fromEnv(): Config {
    config()
    return Config.create(process.env as Partial<IConfig>);
  }

  /**
   * Valida as configurações e retorna uma instância de Config, ou lança um erro caso haja alguma configuração inválida
   */
  static Schema = joi.object<IConfig>({
    SERVER_PORT: joi.number().default(3000),
    DB_ADDRESS: joi.string().required(),
    DB_PORT: joi.number().default(5432),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_DATABASE: joi.string().required(),
    JWT_SECRET: joi.string().default("ALTERAR_ESSA_CHAVE_POR_ALGO_SEGURO_EM_PRODUCAO"),
    APPOINTMENT_JOB_CRON: joi.string().default('0/5 8-20 * * 1-5'), //  de 5 em 5 minutos das 8h as 20h de segunda a sexta
    DEFAULT_ADMIN_EMAIL: joi.string().allow(''),
    DEFAULT_ADMIN_PASSWORD: joi.string().allow(''),
  });
}
