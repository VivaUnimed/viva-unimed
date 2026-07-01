import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { client } from './client';


describe('user controller', () => {
  beforeAll(async () => {
    await client.login();
  })

  it('retorna usuário logado', async () => {
    const res = await client.get('/api/user/me');

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      email: 'admin@viva.com',
    });
  });

  it('cria usuário', async () => {
    const res = await client.post('/api/user', {
      name: 'User 1',
      email: 'user1@teste.com',
      password: '889900',
    });
    expect(res.status).toBe(200);
    expect(res.data.email).toBe('user1@teste.com');
    expect(res.data.name).toBe('User 1');
    expect(res.data.id).toBeDefined();
  })
})
