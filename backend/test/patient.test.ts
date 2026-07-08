import { client } from './client';
import { beforeAll, describe, expect, it } from 'vitest';

describe('patient controller', () => {
  let patientId: number;
  let userId: number;
  let legacyPatientId: number;
  let legacyUserId: number;

  beforeAll(async () => {
    await client.login();
  });

  it('cria paciente com payload transacional completo', async () => {
    const res = await client.post('/api/patient', {
      name: 'Paciente Completo',
      email: `paciente.completo.${Date.now()}@example.com`,
      cpf: '12312312399',
      phone: 53999991234,
      password: '123456',
      birth: '1990-01-15',
    });

    expect(res.status).toBe(200);
    expect(res.data.id).toBeDefined();
    expect(res.data.userId).toBeDefined();
    expect(res.data.name).toBe('Paciente Completo');
    expect(res.data.cpf).toBe('12312312399');
    expect(String(res.data.phone)).toBe('53999991234');
    expect(String(res.data.birth)).toContain('1990-01-15');
    expect(res.data.createdAt).toBeDefined();
    expect(res.data.updatedAt).toBeDefined();

    patientId = res.data.id;
    userId = res.data.userId;
  });

  it('retorna o usuário vinculado com os dados persistidos', async () => {
    const res = await client.get(`/api/user/${userId}`);

    expect(res.status).toBe(200);
    expect(res.data.name).toBe('Paciente Completo');
    expect(res.data.email).toContain('paciente.completo.');
    expect(res.data.cpf).toBe('12312312399');
    expect(String(res.data.phone)).toBe('53999991234');
    expect(res.data.roles).toContain('Paciente');
  });

  it('lista pacientes com dados administrativos completos', async () => {
    const res = await client.get('/api/patient');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);

    const patient = res.data.find((item: any) => item.id === patientId);

    expect(patient).toBeDefined();
    expect(patient).toMatchObject({
      id: patientId,
      userId,
      name: 'Paciente Completo',
      cpf: '12312312399',
    });
    expect(patient.createdAt).toBeDefined();
    expect(patient.updatedAt).toBeDefined();
  });

  it('busca paciente por id com o shape administrativo novo', async () => {
    const res = await client.get(`/api/patient/${patientId}`);

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      id: patientId,
      userId,
      name: 'Paciente Completo',
      cpf: '12312312399',
    });
  });

  it('atualiza dados do paciente e do usuário vinculado em uma única chamada', async () => {
    const res = await client.put(`/api/patient/${patientId}`, {
      name: 'Paciente Atualizado',
      email: `paciente.atualizado.${Date.now()}@example.com`,
      cpf: '99988877766',
      phone: 53988887766,
      birth: '1991-02-20',
    });

    expect(res.status).toBe(200);
    expect(res.data.name).toBe('Paciente Atualizado');
    expect(res.data.cpf).toBe('99988877766');
    expect(String(res.data.phone)).toBe('53988887766');
    expect(String(res.data.birth)).toContain('1991-02-20');

    const userRes = await client.get(`/api/user/${userId}`);
    expect(userRes.status).toBe(200);
    expect(userRes.data.name).toBe('Paciente Atualizado');
    expect(userRes.data.cpf).toBe('99988877766');
    expect(String(userRes.data.phone)).toBe('53988887766');
  });

  it('mantém compatibilidade com criação por userId para o frontend legado', async () => {
    const createdUser = await client.post('/api/user', {
      name: 'Paciente Legado',
      email: `paciente.legado.${Date.now()}@example.com`,
    });

    legacyUserId = createdUser.data.id;

    const res = await client.post('/api/patient', {
      userId: legacyUserId,
      birth: '1988-04-10',
    });

    expect(res.status).toBe(200);
    expect(res.data.userId).toBe(legacyUserId);
    expect(res.data.name).toBe('Paciente Legado');
    expect(String(res.data.birth)).toContain('1988-04-10');

    legacyPatientId = res.data.id;

    const userRes = await client.get(`/api/user/${legacyUserId}`);
    expect(userRes.status).toBe(200);
    expect(userRes.data.roles).toContain('Paciente');
  });

  it('exclui paciente e usuário vinculado por completo', async () => {
    const res = await client.delete(`/api/patient/${patientId}`);
    expect(res.status).toBe(204);

    await expect(client.get(`/api/patient/${patientId}`)).rejects.toMatchObject({
      response: {
        status: 404,
      },
    });

    await expect(client.get(`/api/user/${userId}`)).rejects.toMatchObject({
      response: {
        status: 404,
      },
    });
  });

  it('exclui também pacientes criados pelo fluxo legado', async () => {
    const res = await client.delete(`/api/patient/${legacyPatientId}`);
    expect(res.status).toBe(204);

    await expect(client.get(`/api/user/${legacyUserId}`)).rejects.toMatchObject({
      response: {
        status: 404,
      },
    });
  });
});
