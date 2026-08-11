import { createServer } from 'node:net';
import { writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { App } from '../dist/app';
import { Config } from '../dist/config';

const DB_DATABASE = `viva_unimed_test_${Date.now()}`;
const runtimeFile = resolve(__dirname, '.test-runtime.json');
let app: App | undefined;

async function findAvailablePort(): Promise<number> {
  const requestedPort = Number(process.env.TEST_SERVER_PORT ?? 32145);

  return new Promise((resolvePort, reject) => {
    const probe = createServer();

    probe.once('error', () => {
      // A porta preferida está ocupada. Deixa o sistema operacional escolher
      // uma porta livre, evitando EADDRINUSE durante os testes.
      const fallback = createServer();
      fallback.once('error', reject);
      fallback.listen(0, '127.0.0.1', () => {
        const address = fallback.address();
        if (!address || typeof address === 'string') {
          fallback.close();
          reject(new Error('Não foi possível descobrir uma porta livre para os testes.'));
          return;
        }

        const port = address.port;
        fallback.close(error => error ? reject(error) : resolvePort(port));
      });
    });

    probe.listen(requestedPort, '127.0.0.1', () => {
      probe.close(error => error ? reject(error) : resolvePort(requestedPort));
    });
  });
}

export async function setup() {
  console.log('Iniciando a aplicação de testes...');

  const serverPort = await findAvailablePort();

  await writeFile(
    runtimeFile,
    JSON.stringify({ serverPort }),
    'utf8',
  );

  const config = Config.create({
    DB_ADDRESS: process.env.TEST_DB_ADDRESS ?? '127.0.0.1',
    DB_PORT: Number(process.env.TEST_DB_PORT ?? 5433),
    DB_DATABASE,
    DB_USERNAME: process.env.TEST_DB_USERNAME ?? 'localdbuser',
    DB_PASSWORD: process.env.TEST_DB_PASSWORD ?? 'localdbpassword',
    DB_ENABLE_SSL: false,

    SERVER_PORT: serverPort,
    CORS_ORIGINS: '*',
    JWT_SECRET: 'chave-jwt-exclusiva-dos-testes',

    DEFAULT_ADMIN_EMAIL: 'admin@viva.com',
    DEFAULT_ADMIN_PASSWORD: '123456',

    APPOINTMENT_JOB_CRON: '0 0 1 1 *',
  });

  app = new App(config);
  await app.start();

  console.log(`Aplicação de testes iniciada na porta ${serverPort}.`);
}

export async function teardown() {
  try {
    await app?.stop();
  } finally {
    await rm(runtimeFile, { force: true });
    console.log('Aplicação de testes encerrada.');
  }
}
