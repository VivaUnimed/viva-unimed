import { beforeAll, describe, expect, it } from 'vitest';
import { client } from './client';
import { futureDate, uniqueCpf, uniqueCrm, uniqueSuffix } from './testData';

describe('cria vaga de consulta', () => {
  const suffix = uniqueSuffix('appointment');

  let doctorId: number;
  let specialityId: number;
  let appointmentId: number;

  beforeAll(async () => {
    await client.login();

    const doctRes = await client.post('/api/doctor', {
      name: `Médico Vaga ${suffix}`,
      email: `medico.vaga.${suffix}@example.com`,
      cpf: uniqueCpf('appointment-doctor'),
      crm: uniqueCrm('VAGA'),
    });

    expect(doctRes.data.id).toBeDefined();
    doctorId = doctRes.data.id;

    const specRes = await client.post('/api/speciality', {
      name: `Ginecologia ${suffix}`,
    });

    expect(specRes.data.id).toBeDefined();
    specialityId = specRes.data.id;

    await client.post(`/api/doctor/${doctorId}/speciality`, {
      specialityId,
    });
  });

  it('cria vaga de consulta', async () => {
    const dataConsulta = futureDate(1, 17).toISOString();

    const res = await client.post('/api/appointment', {
      date: dataConsulta,
      doctorId,
      specialityId,
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

    const createdAppointment = res.data.find(
      (item: { id: number }) => item.id === appointmentId,
    );

    expect(createdAppointment).toBeDefined();
    expect(createdAppointment).toHaveProperty('doctor');
    expect(createdAppointment).toHaveProperty('speciality');
    expect(createdAppointment).toHaveProperty('user');
  });

  it('busca vaga por id', async () => {
    expect(appointmentId).toBeDefined();

    const res = await client.get(`/api/appointment/${appointmentId}`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('id', appointmentId);
    expect(res.data).toHaveProperty('doctorId', doctorId);
    expect(res.data).toHaveProperty('specialityId', specialityId);
  });

  it('exclui vaga', async () => {
    expect(appointmentId).toBeDefined();

    const res = await client.delete(`/api/appointment/${appointmentId}`);

    expect(res.status).toBe(204);
  });
});
