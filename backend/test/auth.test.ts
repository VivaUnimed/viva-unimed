import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { client } from './client';


describe('auth controller', () => {
  it('Autenticar usuário admin', async () => {
    const { data, status, headers } = await client.post('/api/auth/login', {
      email: 'admin@viva.com',
      password: '123456',
    });
    expect(status).toEqual(200);
    expect(data.token).toBeDefined();
    expect(data.email).toBe('admin@viva.com');
    expect(headers['set-cookie']?.[0]).toContain('X-VIVA-TOKEN=Bearer');
  });
})
