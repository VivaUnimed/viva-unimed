import { beforeAll, describe, expect, it } from 'vitest';
import { client } from './client';
import { uniqueCpf, uniqueCrm, uniqueSuffix } from './testData';

describe('doctor controller', () => {
  const suffix = uniqueSuffix('doctor');
  const doctorName = `Médico Teste ${suffix}`;
  const initialCrm = uniqueCrm('DOC');
  const updatedCrm = uniqueCrm('UPD');

  let doctorId: number;
  let specialityId: number;

  beforeAll(async () => {
    await client.login();

    const specRes = await client.post('/api/speciality', {
      name: `Ortopedia ${suffix}`,
    });

    expect(specRes.data.id).toBeDefined();
    specialityId = specRes.data.id;
  });

  it('cria médico', async () => {
    const res = await client.post('/api/doctor', {
      name: doctorName,
      email: `medico.${suffix}@example.com`,
      cpf: uniqueCpf('doctor'),
      phone: '51999999999',
      crm: initialCrm,
    });

    expect(res.status).toBe(200);
    expect(res.data.id).toBeDefined();
    expect(res.data.user).toMatchObject({
      name: doctorName,
    });

    doctorId = res.data.id;
  });

  it('lista todos os médicos', async () => {
    const res = await client.get('/api/doctor');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);

    const createdDoctor = res.data.find(
      (item: { id: number }) => item.id === doctorId,
    );

    expect(createdDoctor).toBeDefined();
    expect(createdDoctor).toHaveProperty('user');
    expect(createdDoctor).toHaveProperty('specialities');
    expect(Array.isArray(createdDoctor.specialities)).toBe(true);
    expect(Array.isArray(createdDoctor.user.roles)).toBe(true);
    expect(Array.isArray(createdDoctor.user.permissions)).toBe(true);
  });

  it('atualiza os dados de um médico existente', async () => {
    expect(doctorId).toBeDefined();

    const res = await client.patch(`/api/doctor/${doctorId}`, {
      crm: updatedCrm,
      enabled: true,
    });

    expect(res.status).toBe(200);
    expect(res.data.crm).toBe(updatedCrm);
  });

  it('busca médico por id', async () => {
    expect(doctorId).toBeDefined();

    const res = await client.get(`/api/doctor/${doctorId}`);

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      id: doctorId,
      crm: updatedCrm,
      enabled: true,
    });
    expect(res.data.user.name).toBe(doctorName);
  });

  it('atribui especialidade', async () => {
    const res = await client.post(`/api/doctor/${doctorId}/speciality`, {
      specialityId,
    });

    expect(res.status).toBe(204);
  });

  it('exclui especialidade', async () => {
    const res = await client.delete(`/api/doctor/${doctorId}/speciality`, {
      data: { specialityId },
    });

    expect(res.status).toBe(204);
  });

  it('exclui médico', async () => {
    const res = await client.delete(`/api/doctor/${doctorId}`);

    expect(res.status).toBe(204);
  });
});
