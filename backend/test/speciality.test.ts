import { beforeAll, describe, expect, it } from 'vitest';
import { client } from './client';
import { uniqueSuffix } from './testData';

describe('speciality controller', () => {
  const suffix = uniqueSuffix('speciality');
  const cardiologiaName = `Cardiologia ${suffix}`;
  const dermatologiaName = `Dermatologia ${suffix}`;
  const pediatriaName = `Pediatria ${suffix}`;

  let cardiologiaId: number;
  let dermatologiaId: number;

  beforeAll(async () => {
    await client.login();
  });

  it('cria especialidade (cardiologia)', async () => {
    const res = await client.post('/api/speciality', {
      name: cardiologiaName,
    });

    expect(res.status).toBe(200);
    expect(res.data.id).toBeDefined();
    cardiologiaId = res.data.id;
  });

  it('cria especialidade (dermatologia)', async () => {
    const res = await client.post('/api/speciality', {
      name: dermatologiaName,
    });

    expect(res.status).toBe(200);
    expect(res.data.id).toBeDefined();
    dermatologiaId = res.data.id;
  });

  it('retorna todas as especialidades', async () => {
    const res = await client.get('/api/speciality');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);

    const criada = res.data.find(
      (item: { id: number }) => item.id === cardiologiaId,
    );

    expect(criada).toBeDefined();
    expect(criada).toHaveProperty('doctors');
    expect(Array.isArray(criada.doctors)).toBe(true);
  });

  it('retorna especialidade pelo id', async () => {
    expect(cardiologiaId).toBeDefined();

    const res = await client.get(`/api/speciality/${cardiologiaId}`);

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      id: cardiologiaId,
      name: cardiologiaName,
    });
    expect(Array.isArray(res.data.doctors)).toBe(true);
  });

  it('atualiza especialidade', async () => {
    expect(dermatologiaId).toBeDefined();

    const res = await client.put(`/api/speciality/${dermatologiaId}`, {
      name: pediatriaName,
    });

    expect(res.status).toBe(200);
    expect(res.data.name).toBe(pediatriaName);
  });

  it('remove especialidade', async () => {
    expect(dermatologiaId).toBeDefined();

    const res = await client.delete(`/api/speciality/${dermatologiaId}`);

    expect(res.status).toBe(204);
  });
});
