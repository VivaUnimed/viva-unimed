import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { client } from './client';

describe('speciality controller', () => {
  beforeAll(async () => {
    await client.login();
  })

  it('cria especialidade', async () => {
    const res = await client.post('/api/speciality', {
      name: 'Cardiologia'
    })
    expect(res.status).toBe(200);
  })

  it('retorna todas as especialidades', async () => {
  const res = await client.get('/api/speciality');

  expect(res.status).toBe(200);
  expect(res.data[0]).toMatchObject({
    name: 'Cardiologia',
  });
});

  it('retorna especialidade pelo id', async () => {
    const res = await client.get('/api/speciality/1');

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      name: 'Cardiologia',
    });
  });

  it('atualiza especialidade', async () => {
    const res = await client.put(`/api/speciality/1`, {
      name: 'Pediatria',
    });
    expect(res.status).toBe(200);
  });

  it('remove especialidade', async () => {
    const res = await client.delete(`/api/speciality/1`, {
      data: {
        name: 'Pediatria',
      },
    });
    expect(res.status).toBe(204);
  })

})

