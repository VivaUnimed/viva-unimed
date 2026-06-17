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
  // === CONFIGURAÇÕES DE AGENDAMENTO (APPOINTMENTS) ===
  /** Antecedência mínima em minutos para criar ou editar uma vaga (Lead Time) */
  APPOINTMENT_MIN_LEAD_MINUTES: number;

  /** Duração da consulta em minutos para bloquear a agenda do médico e evitar double-booking */
  APPOINTMENT_SLOT_MINUTES: number;

  /** Limite máximo de tentativas de notificação que um pedido pode receber antes de ser travado */
  APPOINTMENT_REQUEST_MAX_ATTEMPTS: number;

  /** Tempo inicial em minutos que o paciente fica "de molho" (cooldown) após recusar ou ignorar uma vaga */
  APPOINTMENT_REQUEST_BACKOFF_MINUTES: number;

  /** Multiplicador para aumentar o tempo de cooldown a cada nova tentativa perdida (Ex: se for 2, o cooldown dobra a cada falha) */
  APPOINTMENT_REQUEST_BACKOFF_MULTIPLIER: number;

  /** Tempo em minutos de validade do token de reset de senha */
  PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES: number;
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
   * Carrega configurações do arquivo .env na raiz do projeto
   */
  static fromEnv(): Config {
    config();
    return Config.create(process.env as Partial<IConfig>);
  }

  /**
   * Valida as configurações e retorna uma instância de Config
   */
  static Schema = joi.object<IConfig>({
    SERVER_PORT: joi.number().default(3000),
    DB_ADDRESS: joi.string().required(),
    DB_PORT: joi.number().default(5432),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_DATABASE: joi.string().required(),
    JWT_SECRET: joi.string().default("ALTERAR_ESSA_CHAVE_POR_ALGO_SEGURO_EM_PRODUCAO"),
    APPOINTMENT_JOB_CRON: joi.string().default('0/5 8-20 * * 1-5'),
    DEFAULT_ADMIN_EMAIL: joi.string().allow(''),
    DEFAULT_ADMIN_PASSWORD: joi.string().allow(''),
    APPOINTMENT_MIN_LEAD_MINUTES: joi.number().default(30), // Padrão: 30 minutos
    APPOINTMENT_SLOT_MINUTES: joi.number().default(30),     // Padrão: 30 minutos
    APPOINTMENT_REQUEST_MAX_ATTEMPTS: joi.number().default(3),
    APPOINTMENT_REQUEST_BACKOFF_MINUTES: joi.number().default(10),
    APPOINTMENT_REQUEST_BACKOFF_MULTIPLIER: joi.number().default(2),
    PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES: joi.number().default(15),
  });
}
