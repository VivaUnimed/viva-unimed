import { App } from '../dist/app';
import { Config } from '../dist/config';

const DB_DATABASE = `test_viva_${Date.now()}`;

const config = Config.create({
  DB_PORT: 5432,
  DB_ADDRESS: 'localhost',
  DB_DATABASE,
  DB_USERNAME: 'postgres',
  DB_PASSWORD: '12345678',
  DB_ENABLE_SSL: false,
  SERVER_PORT: 32145,
  DEFAULT_ADMIN_EMAIL: 'admin@viva.com',
  DEFAULT_ADMIN_PASSWORD: '123456',
});

const app = new App(config);

export async function setup() {
  await app.start();
  console.log('✅ App Started!');
}

export async function teardown() {
  await app.stop();
  console.log('App Stopped!')
}
