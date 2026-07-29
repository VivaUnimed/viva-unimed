import { client } from './client';
import { describe, it, expect, beforeAll } from 'vitest'

describe('patient controller', () => {
  let patientId: number;

  beforeAll(async () => {
    await client.login();
  });

  it('cria paciente', async () => {
    const res = await client.post('/api/patient', {
      name: 'Josenildo',
      email: `josenildo.${Date.now()}@example.com`,
      cpf: '42144477735',
      birth: '1980-05-15',
    });

    expect(res.status).toBe(200);
    expect(res.data.birth).toBe('1980-05-15');

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
    expect(res.data).toHaveProperty('name', 'Josenildo');
    expect(res.data.birth).toContain('1980-05-15'); // toContain para ignorar as horas
  })

  it('exclui paciente', async () => {
    const res = await client.delete(`/api/patient/${patientId}`)
    expect(res.status).toBe(204);
  })

});
