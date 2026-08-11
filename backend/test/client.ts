import axios, {
  Axios,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosInstance,
} from 'axios';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type RuntimeConfig = {
  serverPort: number;
};

const runtimeFile = resolve(__dirname, '.test-runtime.json');

function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolvePromise => {
    setTimeout(resolvePromise, milliseconds);
  });
}

async function getTestBaseUrl(): Promise<string> {
  /*
   * O globalSetup do Vitest pode terminar poucos milissegundos depois que
   * o arquivo de teste começa a ser importado. Por isso, o cliente aguarda
   * a criação do arquivo em vez de falhar durante o import do módulo.
   */
  const timeoutMs = 10_000;
  const intervalMs = 100;
  const startedAt = Date.now();

  while (!existsSync(runtimeFile)) {
    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(
        `Arquivo de configuração dos testes não encontrado: ${runtimeFile}. ` +
          'Confirme que backend/vitest.config.ts possui ' +
          `globalSetup: './test/setup.ts' e execute o teste com Vitest.`,
      );
    }

    await sleep(intervalMs);
  }

  const runtime = JSON.parse(
    readFileSync(runtimeFile, 'utf8'),
  ) as RuntimeConfig;

  if (!Number.isInteger(runtime.serverPort) || runtime.serverPort <= 0) {
    throw new Error(
      `Porta inválida no arquivo de configuração dos testes: ${runtimeFile}.`,
    );
  }

  return `http://127.0.0.1:${runtime.serverPort}`;
}

class AppClient
  implements
    Pick<
      Axios,
      'get' | 'post' | 'put' | 'patch' | 'request' | 'delete'
    >
{
  private http?: AxiosInstance;
  private initialization?: Promise<AxiosInstance>;
  private authorization?: string;

  private async getHttp(): Promise<AxiosInstance> {
    if (this.http) {
      return this.http;
    }

    if (!this.initialization) {
      this.initialization = getTestBaseUrl().then(baseURL => {
        const instance = axios.create({
          baseURL,
          timeout: 15_000,
        });

        if (this.authorization) {
          instance.defaults.headers.common.Authorization = this.authorization;
        }

        this.http = instance;
        return instance;
      });
    }

    return this.initialization;
  }

  async login(email = 'admin@viva.com', password = '123456') {
    const { data } = await this.post('/api/auth/login', {
      email,
      password,
    });

    const token = data?.token;

    if (!token) {
      throw new Error('Token não retornado pelo login.');
    }

    this.authorization = `Bearer ${token}`;

    const http = await this.getHttp();
    http.defaults.headers.common.Authorization = this.authorization;
  }

  async logout() {
    const http = await this.getHttp();

    await http.get('/api/auth/logout');

    this.authorization = undefined;
    delete http.defaults.headers.common.Authorization;
  }

  async post<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> {
    const http = await this.getHttp();
    return http.post<T, R, D>(url, data, config);
  }

  async get<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> {
    const http = await this.getHttp();
    return http.get<T, R, D>(url, config);
  }

  async put<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> {
    const http = await this.getHttp();
    return http.put<T, R, D>(url, data, config);
  }

  async patch<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> {
    const http = await this.getHttp();
    return http.patch<T, R, D>(url, data, config);
  }

  async request<T = any, R = AxiosResponse<T>, D = any>(
    config: AxiosRequestConfig<D>,
  ): Promise<R> {
    const http = await this.getHttp();
    return http.request<T, R, D>(config);
  }

  async delete<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> {
    const http = await this.getHttp();
    return http.delete<T, R, D>(url, config);
  }

  create() {
    return new AppClient();
  }
}

export const client = new AppClient();
