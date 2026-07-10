import axios, { Axios, AxiosRequestConfig, AxiosResponse } from 'axios';

class AppClient implements Pick<Axios,'get'|'post'|'patch'|'request'|'delete'> {
  private http: Axios;
  constructor(private baseURL: string) {
    this.http = axios.create({ baseURL });
  }

  async login(email = 'admin@viva.com', password = '123456') {
    const { data } = await this.post('/api/auth/login', {
      email,
      password,
    });
    const token = data?.token;
    if(!token) throw new Error('missing token');

    this.http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async logout() {
    await this.get('/api/auth/logout');
    this.http.defaults.headers.common['Authorization'] = '';
  }

  post<T = any, R = AxiosResponse<T, any, {}>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.http.post(url, data, config);
  }
  get<T = any, R = AxiosResponse<T, any, {}>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.http.get(url, config);
  }
  patch<T = any, R = AxiosResponse<T, any, {}>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.http.patch(url, data, config);
  }

  request<T = any, R = AxiosResponse<T, any, {}>, D = any>(config: AxiosRequestConfig<D>): Promise<R> {
    return this.http.request(config);
  }
  delete<T = any, R = AxiosResponse<T, any, {}>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.http.delete(url, config);
  }

  create() {
    return new AppClient(this.baseURL);
  }
}

export const client = new AppClient('http://localhost:32145');
