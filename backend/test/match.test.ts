import { beforeAll, describe, expect, it } from 'vitest';
import { client } from './client';
import {
  futureDate,
  uniqueCpf,
  uniqueCrm,
  uniqueSuffix,
} from './testData';

describe('Match Controller', () => {
  const admin = client.create();
  const patientClient = client.create();

  const suffix = uniqueSuffix('match');
  const patientEmail = `paciente.match.${suffix}@example.com`;
  const patientPassword = 'PacienteMatch@123';

  let doctorId: number;
  let specialityId: number;
  let patientId: number;
  let appointmentId: number;
  let requestId: number;
  let matchId: number;

  beforeAll(async () => {
    await admin.login();

    const specRes = await admin.post('/api/speciality', {
      name: `Cardiologia Match ${suffix}`,
    });
    specialityId = specRes.data.id;

    const doctRes = await admin.post('/api/doctor', {
      name: `Médico Match ${suffix}`,
      email: `medico.match.${suffix}@example.com`,
      cpf: uniqueCpf('match-doctor'),
      crm: uniqueCrm('MATCH'),
    });
    doctorId = doctRes.data.id;

    await admin.post(`/api/doctor/${doctorId}/speciality`, {
      specialityId,
    });

    const patientRes = await admin.post('/api/patient', {
      name: `Paciente Match ${suffix}`,
      email: patientEmail,
      cpf: uniqueCpf('match-patient'),
      birth: '1990-01-01',
      password: patientPassword,
    });
    patientId = patientRes.data.id;

    await patientClient.login(patientEmail, patientPassword);

    const appRes = await admin.post('/api/appointment', {
      date: futureDate(2, 11).toISOString(),
      doctorId,
      specialityId,
    });
    appointmentId = appRes.data.id;

    const reqRes = await patientClient.post('/api/appointment-request', {
      specialityId,
      date: futureDate(5, 13).toISOString(),
    });
    requestId = reqRes.data.id;

    const matchRes = await admin.post('/api/match', {
      appointmentId,
      requestId,
      status: 'waiting_response',
      expiresAt: futureDate(0, 15).toISOString(),
    });
    matchId = matchRes.data.id;
  });

  it('busca match por id', async () => {
    const res = await patientClient.get(`/api/match/${matchId}`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('id', matchId);
    expect(res.data).toHaveProperty('appointmentId', appointmentId);
    expect(res.data).toHaveProperty('requestId', requestId);
  });

  it('rejeita um match', async () => {
    const res = await patientClient.post(`/api/match/${matchId}/reject`);

    expect([200, 204]).toContain(res.status);

    const checkRes = await patientClient.get(`/api/match/${matchId}`);
    expect(checkRes.data.status).toBe('rejected');
    expect(checkRes.data.respondedAt).toBeTruthy();
  });

  it('cancela um match', async () => {
    const cancelClient = client.create();
    const cancelEmail = `paciente.cancel.${suffix}@example.com`;
    const cancelPassword = 'PacienteCancel@123';

    const patientRes = await admin.post('/api/patient', {
      name: `Paciente Cancel ${suffix}`,
      email: cancelEmail,
      cpf: uniqueCpf('match-cancel-patient'),
      birth: '1990-01-01',
      password: cancelPassword,
    });

    await cancelClient.login(cancelEmail, cancelPassword);

    const appRes = await admin.post('/api/appointment', {
      date: futureDate(3, 23).toISOString(),
      doctorId,
      specialityId,
    });

    const reqRes = await cancelClient.post('/api/appointment-request', {
      specialityId,
      date: futureDate(3, 23).toISOString(),
    });

    const newMatchRes = await admin.post('/api/match', {
      appointmentId: appRes.data.id,
      requestId: reqRes.data.id,
      status: 'waiting_response',
      expiresAt: futureDate(0, 20).toISOString(),
    });

    const matchToCancel = newMatchRes.data.id;

    await cancelClient.post(`/api/match/${matchToCancel}/confirm`);

    const res = await cancelClient.post(
      `/api/match/${matchToCancel}/cancel`,
    );
    expect([200, 204]).toContain(res.status);

    const checkRes = await cancelClient.get(
      `/api/match/${matchToCancel}`,
    );
    expect(checkRes.data.status).toBe('cancelled');
  });

  it('confirma um match', async () => {
    const confirmClient = client.create();
    const confirmEmail = `paciente.confirm.${suffix}@example.com`;
    const confirmPassword = 'PacienteConfirm@123';

    const patientRes = await admin.post('/api/patient', {
      name: `Paciente Confirm ${suffix}`,
      email: confirmEmail,
      cpf: uniqueCpf('match-confirm-patient'),
      birth: '1990-01-01',
      password: confirmPassword,
    });

    await confirmClient.login(confirmEmail, confirmPassword);

    const appRes = await admin.post('/api/appointment', {
      date: futureDate(4, 37).toISOString(),
      doctorId,
      specialityId,
    });

    const reqRes = await confirmClient.post('/api/appointment-request', {
      specialityId,
      date: futureDate(4, 37).toISOString(),
    });

    const newMatchRes = await admin.post('/api/match', {
      appointmentId: appRes.data.id,
      requestId: reqRes.data.id,
      status: 'waiting_response',
      expiresAt: futureDate(0, 25).toISOString(),
    });

    const matchToConfirm = newMatchRes.data.id;

    const res = await confirmClient.post(
      `/api/match/${matchToConfirm}/confirm`,
    );
    expect([200, 204]).toContain(res.status);

    const checkRes = await confirmClient.get(
      `/api/match/${matchToConfirm}`,
    );
    expect(checkRes.data.status).toBe('accepted');
    expect(checkRes.data.respondedAt).toBeTruthy();
  });
});
