import { describe, it, expect, beforeAll } from 'vitest'
import { client } from './client';

describe('speciality controller', () => {
  let cardiologiaId: number;
  let dermatologiaId: number;

  beforeAll(async () => {
    await client.login();
  })

  it('cria especialidade (cardiologia)', async () => {
    const res = await client.post('/api/speciality', { name: 'Cardiologia' });
    expect(res.status).toBe(200);
    cardiologiaId = res.data.id;
  });

  it('cria especialidade (dermatologia)', async () => {
    const res = await client.post('/api/speciality', { name: 'Dermatologia' });
    expect(res.status).toBe(200);
    dermatologiaId = res.data.id;
  })

  it('retorna todas as especialidades', async () => {
    const res = await client.get('/api/speciality');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);

    expect(res.data.length).toBeGreaterThan(0);

    expect(res.data[0]).toHaveProperty('id');
    expect(res.data[0]).toHaveProperty('name');
    expect(res.data[0]).toHaveProperty('doctors');
    expect(Array.isArray(res.data[0].doctors)).toBe(true);
  });

  it('retorna especialidade pelo id', async () => {
    const res = await client.get(`/api/speciality/${cardiologiaId}`);

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      id: cardiologiaId,
      name: 'Cardiologia'
    });
    expect(res.data).toHaveProperty('doctors');
    expect(Array.isArray(res.data.doctors)).toBe(true);
  });

  it('atualiza especialidade', async () => {
    const res = await client.put(`/api/speciality/${dermatologiaId}`, { name: 'Pediatria' });
    expect(res.status).toBe(200);
  });

  it('remove especialidade', async () => {
    const res = await client.delete(`/api/speciality/${dermatologiaId}`);
    expect(res.status).toBe(204);
  })
})
