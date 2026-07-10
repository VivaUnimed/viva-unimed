import { client } from './client';
import { describe, it, expect, beforeAll } from 'vitest'

describe('patient controller', () => {
  let userId: number;
  let patientId: number;

  beforeAll(async () => {
    await client.login();

    const userRes = await client.post('/api/user', {
      name: 'Paciente Teste',
      email: `paciente.teste.${Date.now()}@example.com`,
    });
    userId = userRes.data.id;
  });

  it('cria paciente', async () => {
    const res = await client.post('/api/patient', {
      birth: '1997-05-15',
      userId,
    });

    expect(res.status).toBe(200);
    expect(res.data.birth).toBe('1997-05-15');

    expect(res.data.id).toBeDefined();
    patientId = res.data.id;
  });

  it('retorna todos os pacientes', async () => {
    const res = await client.get('/api/patient');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);

    const primeiroPaciente = res.data[0];
    expect(primeiroPaciente).toHaveProperty('id');
    expect(primeiroPaciente).toHaveProperty('name');
    expect(primeiroPaciente).toHaveProperty('email');
    expect(primeiroPaciente).toHaveProperty('cpf');
    expect(primeiroPaciente).toHaveProperty('phone');
    expect(primeiroPaciente).toHaveProperty('roles');
    expect(primeiroPaciente).toHaveProperty('permissions');
    expect(primeiroPaciente).toHaveProperty('birth');

    // valida os arrays de permissões e perfis
    expect(Array.isArray(primeiroPaciente.roles)).toBe(true);
    expect(Array.isArray(primeiroPaciente.permissions)).toBe(true);
  });

  it('busca paciente por id', async () => {
    const res = await client.get(`/api/patient/${patientId}`)
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('name', 'Paciente Teste');
    expect(res.data.birth).toContain('1997-05-15'); // toContain para ignorar as horas
  })

  it('exclui paciente', async () => {
    const res = await client.delete(`/api/patient/${patientId}`)
    expect(res.status).toBe(204);
  })

});
