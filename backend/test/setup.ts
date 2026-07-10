import { App } from '../dist/app';
import { Config } from '../dist/config';

const DB_DATABASE = 'viva_unimed';

const config = Config.create({
  DB_PORT: 5433,
  DB_ADDRESS: 'localhost',
  DB_DATABASE,
  DB_USERNAME: 'localdbuser',     // Corrigir esta linha
  DB_PASSWORD: 'localdbpassword', // Corrigir esta linha
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
