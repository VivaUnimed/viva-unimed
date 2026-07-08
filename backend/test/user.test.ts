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
      cpf: '12345678901',
      phone: 53999990001,
      password: '889900',
    });
    expect(res.status).toBe(200);
    expect(res.data.email).toBe('user1@teste.com');
    expect(res.data.name).toBe('User 1');
    expect(res.data.cpf).toBe('12345678901');
    expect(String(res.data.phone)).toBe('53999990001');
    expect(res.data.id).toBeDefined();
  })

  it('atualiza usuário', async () => {
    const createdUser = await client.post('/api/user', {
      name: 'User 2',
      email: `user2.${Date.now()}@teste.com`,
    });

    const res = await client.put(`/api/user/${createdUser.data.id}`, {
      name: 'User 2 Editado',
      email: `user2.editado.${Date.now()}@teste.com`,
      cpf: '98765432100',
      phone: 53999990002,
    });

    expect(res.status).toBe(200);
    expect(res.data.name).toBe('User 2 Editado');
    expect(res.data.cpf).toBe('98765432100');
    expect(String(res.data.phone)).toBe('53999990002');
  })

  it('adiciona permissão', async () => {
    const res = await client.put(`/api/user/1/roles`, {
      role: 'Paciente',
    });
    expect(res.status).toBe(204);
  })

  it('remove permissão', async () => {
    const res = await client.delete(`/api/user/1/roles`, {
      data: {
        role: 'Paciente',
      },
    });
    expect(res.status).toBe(204);
  })

})
