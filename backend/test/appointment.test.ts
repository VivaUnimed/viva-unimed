import { client } from './client'
import { describe, it, expect, beforeAll } from 'vitest'

describe('cria vaga de consulta', () => {
  let userId: number;
  let doctorId: number;
  let specialityId: number;
  let appointmentId: number;

  beforeAll( async () => {
    await client.login();

    const userRes = await client.post('/api/user', {
      name: 'Médico Teste 2',
      email: `medico.teste2.${Date.now()}@example.com`,
    });
    userId = userRes.data.id;

    const doctRes = await client.post('/api/doctor', {
      userId,
      crm: '12345-RS',
      enabled: true,
    })
    doctorId = doctRes.data.id;

    const specRes = await client.post('/api/speciality', {
      name: 'Ginecologista',
    });
    specialityId = specRes.data.id;

    await client.post(`/api/doctor/${doctorId}/speciality`, {
      specialityId: specialityId
    });
  });

  it('cria vaga de consulta', async () => {
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 1);
    const dataConsulta = dataFutura.toISOString();

    const res = await client.post('/api/appointment', {
      date: dataConsulta,
      doctorId,
      specialityId
    });

    expect(res.status).toBe(200);
    expect(res.data.date).toBe(dataConsulta);
    expect(res.data.id).toBeDefined();
    expect(res.data.doctorId).toBe(doctorId);
    expect(res.data.specialityId).toBe(specialityId);

    appointmentId = res.data.id;
  });

  it('lista todas as vagas', async () => {
    const res = await client.get('/api/appointment');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);

    const createdAppointmentIsInList = res.data.some((app: any) => app.id === appointmentId);
    expect(createdAppointmentIsInList).toBe(true);

    const primeiraVaga = res.data[0];

    // raiz do objeto
    expect(primeiraVaga).toHaveProperty('id');
    expect(primeiraVaga).toHaveProperty('date');
    expect(primeiraVaga).toHaveProperty('doctorId');
    expect(primeiraVaga).toHaveProperty('specialityId');
    expect(primeiraVaga).toHaveProperty('createdBy');
    expect(primeiraVaga).toHaveProperty('status');
    expect(primeiraVaga).toHaveProperty('createAt');
    expect(primeiraVaga).toHaveProperty('updatedAt');

    // objetos aninhados (joins)
    expect(primeiraVaga).toHaveProperty('doctor');
    expect(typeof primeiraVaga.doctor).toBe('object');
    expect(primeiraVaga.doctor).toHaveProperty('crm');

    expect(primeiraVaga).toHaveProperty('speciality');
    expect(typeof primeiraVaga.speciality).toBe('object');
    expect(primeiraVaga.speciality).toHaveProperty('name');

    expect(primeiraVaga).toHaveProperty('user');
    expect(typeof primeiraVaga.user).toBe('object');
    expect(primeiraVaga.user).toHaveProperty('email');
  });

  it('busca vaga por id', async () => {
    const res = await client.get(`/api/appointment/${appointmentId}`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('id', appointmentId);
    expect(res.data).toHaveProperty('doctorId', doctorId);
    expect(res.data).toHaveProperty('specialityId', specialityId);
    expect(res.data).toHaveProperty('status');
    expect(res.data).toHaveProperty('doctor');
    expect(res.data).toHaveProperty('speciality');
    expect(res.data).toHaveProperty('user');
  });

  it('exclui vaga', async () => {
    const res = await client.delete(`/api/appointment/${appointmentId}`);
    expect(res.status).toBe(204);
  });

});
