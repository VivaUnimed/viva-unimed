import { client } from './client';
import { describe, it, expect, beforeAll } from 'vitest'

describe('doctor controller', () => {
  let userId: number;
  let doctorId: number;
  let specialityId: number;

  beforeAll(async () => {
    await client.login();
    const userRes = await client.post('/api/user', {
      name: 'Médico Teste',
      email: `medico.teste.${Date.now()}@example.com`,
    });
    userId = userRes.data.id;

    const specRes = await client.post('/api/speciality', {
      name: 'Ortopedia',
    });
    specialityId = specRes.data.id;
  });

  it('cria médico', async () => {
    const res = await client.post('/api/doctor', {
      userId,
      crm: '1234-RS',
      enabled: true,
    });

    expect(res.status).toBe(200);
    expect(res.data.id).toBeDefined();

    doctorId = res.data.id;
  });

  it('lista todos os médicos', async () => {
    const res = await client.get('/api/doctor');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);

    const createdDoctorIsInList = res.data.some((doc: any) => doc.id === doctorId);

    expect(createdDoctorIsInList).toBe(true);
  });

  it('atualiza os dados de um medico existente', async () => {
    const res = await client.put(`/api/doctor/${doctorId}`, {
      userId,
      crm: '1236-RJ',
      enabled: true,
    });
  });

  it('busca médico por id', async () => {
    const res = await client.get(`/api/doctor/${doctorId}`)
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      name: 'Médico Teste',
      crm:  '1236-RJ',
      enabled: true,
    });
  });

  it('atribui especialidade', async () => {
    const res = await client.post(`/api/doctor/${doctorId}/speciality`, {
      specialityId: specialityId
    });
    expect(res.status).toBe(204);
  });

  it('exclui especialidade', async () => {
    const res = await client.delete(`/api/doctor/${doctorId}/speciality`, {
      data: {
        specialityId: specialityId
      }
    });

    expect(res.status).toBe(204);
  });

  it('exclui médico', async () => {
    const res = await client.delete(`/api/doctor/${doctorId}`);
    expect(res.status).toBe(204);
  });

});
