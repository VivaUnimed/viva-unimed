import joi from "joi";
import { config } from "dotenv";

export interface IConfig {
  SERVER_PORT: number;
  DB_ADDRESS: string;
  DB_PORT: number;
  DB_PASSWORD: string;
  DB_USERNAME: string;
  DB_DATABASE: string;
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
  });
}
