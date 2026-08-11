import { beforeAll, describe, expect, it } from 'vitest';
import { client } from './client';
import { uniqueCpf, uniqueSuffix } from './testData';

describe('patient controller', () => {
  const suffix = uniqueSuffix('patient');
  const patientName = `Josenildo ${suffix}`;
  let patientId: number;

  beforeAll(async () => {
    await client.login();
  });

  it('cria paciente', async () => {
    const res = await client.post('/api/patient', {
      name: patientName,
      email: `josenildo.${suffix}@example.com`,
      cpf: uniqueCpf('patient'),
      birth: '1980-05-15',
    });

    expect(res.status).toBe(200);
    expect(res.data.birth).toContain('1980-05-15');
    expect(res.data.id).toBeDefined();

    patientId = res.data.id;
  });

  it('retorna todos os pacientes', async () => {
    const res = await client.get('/api/patient');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);

    const pacienteCriado = res.data.find(
      (patient: { id: number }) => patient.id === patientId,
    );

    expect(pacienteCriado).toBeDefined();
    expect(pacienteCriado).toHaveProperty('id');
    expect(pacienteCriado).toHaveProperty('name');
    expect(pacienteCriado).toHaveProperty('email');
    expect(pacienteCriado).toHaveProperty('cpf');
    expect(pacienteCriado).toHaveProperty('roles');
    expect(pacienteCriado).toHaveProperty('permissions');
    expect(pacienteCriado).toHaveProperty('birth');
    expect(Array.isArray(pacienteCriado.roles)).toBe(true);
    expect(Array.isArray(pacienteCriado.permissions)).toBe(true);
  });

  it('busca paciente por id', async () => {
    expect(patientId).toBeDefined();

    const res = await client.get(`/api/patient/${patientId}`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('name', patientName);
    expect(res.data.birth).toContain('1980-05-15');
  });

  it('exclui paciente', async () => {
    expect(patientId).toBeDefined();

    const res = await client.delete(`/api/patient/${patientId}`);

    expect(res.status).toBe(204);
  });
});
