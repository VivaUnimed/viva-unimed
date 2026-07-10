import { describe, it, expect, beforeAll } from 'vitest'
import { client } from './client';

describe('user controller', () => {
  let userId: number;

  beforeAll(async () => {
    await client.login();
  })

  it('cria usuário', async () => {
    const res = await client.post('/api/user', {
      name: 'User 1',
      email: `user1.${Date.now()}@teste.com`,
      password: '889900',
      cpf: `123456789${Math.floor(Math.random() * 90 + 10)}`, // CPF dinâmico para evitar duplicados
      phone: 51999999999,
      roles: ['Paciente']
    });

    expect(res.status).toBe(200);
    expect(res.data.name).toBe('User 1');
    expect(res.data.id).toBeDefined();

    userId = res.data.id;
  });

  it('retorna usuário logado', async () => {
    const res = await client.get('/api/user/me');

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      email: 'admin@viva.com',
    });
  });

  it('retorna todos os usuários', async () => {
    const res = await client.get('/api/user');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  });

  it('retorna usuário pelo id', async () => {
    const res = await client.get(`/api/user/${userId}`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('id', userId);
    expect(res.data).toHaveProperty('name', 'User 1');
  });

  it('adiciona permissão', async () => {
    const res = await client.put(`/api/user/${userId}/roles`, {
      role: 'Paciente',
    });
    expect(res.status).toBe(204);
  });

  it('remove permissão', async () => {
    const res = await client.delete(`/api/user/${userId}/roles`, {
      data: {
        role: 'Paciente',
      },
    });
    expect(res.status).toBe(204);
  });

})
