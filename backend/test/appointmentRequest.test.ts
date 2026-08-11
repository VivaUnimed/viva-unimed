import { AxiosError } from 'axios';
import { beforeAll, describe, expect, it } from 'vitest';
import { client } from './client';
import { futureDate, uniqueCpf, uniqueCrm, uniqueSuffix } from './testData';

async function expectHttpStatus(
  promise: Promise<unknown>,
  expectedStatus: number,
): Promise<void> {
  try {
    await promise;
    throw new Error(`A requisição deveria retornar HTTP ${expectedStatus}.`);
  } catch (error) {
    expect(error).toBeInstanceOf(AxiosError);
    expect((error as AxiosError).response?.status).toBe(expectedStatus);
  }
}

describe('Fila inteligente do paciente autenticado', () => {
  const suffix = uniqueSuffix('appointment-request-auth');

  const admin = client.create();
  const patientA = client.create();
  const patientB = client.create();
  const anonymous = client.create();

  const patientAPassword = 'PacienteFila@123';
  const patientBPassword = 'PacienteFila@456';
  const patientAEmail = `paciente.fila.a.${suffix}@example.com`;
  const patientBEmail = `paciente.fila.b.${suffix}@example.com`;

  let doctorId: number;
  let specialityId: number;
  let patientAId: number;
  let patientBId: number;
  let patientARequestId: number;
  let patientBRequestId: number;

  beforeAll(async () => {
    await admin.login();

    const doctorResponse = await admin.post('/api/doctor', {
      name: `Médico Fila ${suffix}`,
      email: `medico.fila.${suffix}@example.com`,
      cpf: uniqueCpf('appointment-request-doctor'),
      crm: uniqueCrm('FILA'),
    });
    doctorId = doctorResponse.data.id;
    expect(doctorId).toBeDefined();

    const specialityResponse = await admin.post('/api/speciality', {
      name: `Especialidade Fila ${suffix}`,
    });
    specialityId = specialityResponse.data.id;
    expect(specialityId).toBeDefined();

    await admin.post(`/api/doctor/${doctorId}/speciality`, {
      specialityId,
    });

    const patientAResponse = await admin.post('/api/patient', {
      name: `Paciente A Fila ${suffix}`,
      email: patientAEmail,
      cpf: uniqueCpf('appointment-request-patient-a'),
      birth: '1990-01-10',
      password: patientAPassword,
    });
    patientAId = patientAResponse.data.id;
    expect(patientAId).toBeDefined();

    const patientBResponse = await admin.post('/api/patient', {
      name: `Paciente B Fila ${suffix}`,
      email: patientBEmail,
      cpf: uniqueCpf('appointment-request-patient-b'),
      birth: '1992-02-20',
      password: patientBPassword,
    });
    patientBId = patientBResponse.data.id;
    expect(patientBId).toBeDefined();

    await patientA.login(patientAEmail, patientAPassword);
    await patientB.login(patientBEmail, patientBPassword);
  });

  it('protege criação e listagem com autenticação JWT', async () => {
    await expectHttpStatus(
      anonymous.post('/api/appointment-request', {
        specialityId,
        doctorId,
        date: futureDate(2).toISOString(),
      }),
      401,
    );

    await expectHttpStatus(
      anonymous.get('/api/appointment-request'),
      401,
    );
  });

  it('cria solicitação sem patientId e usa o paciente identificado pelo JWT', async () => {
    const response = await patientA.post('/api/appointment-request', {
      specialityId,
      doctorId,
      date: futureDate(3, 15).toISOString(),
    });

    expect(response.status).toBe(200);
    expect(response.data.id).toBeDefined();
    expect(response.data.patientId).toBe(patientAId);
    expect(response.data.specialityId).toBe(specialityId);
    expect(response.data.doctorId).toBe(doctorId);
    expect(response.data.status).toBe('waiting');
    expect(response.data.attempts).toBe(0);

    patientARequestId = response.data.id;
  });

  it('mantém a validação de duplicidade para a mesma especialidade', async () => {
    await expectHttpStatus(
      patientA.post('/api/appointment-request', {
        specialityId,
        doctorId,
        date: futureDate(4, 20).toISOString(),
      }),
      409,
    );
  });

  it('permite que outro paciente tenha sua própria fila na mesma especialidade', async () => {
    const response = await patientB.post('/api/appointment-request', {
      specialityId,
      doctorId,
      date: futureDate(5, 30).toISOString(),
    });

    expect(response.status).toBe(200);
    expect(response.data.patientId).toBe(patientBId);
    expect(response.data.status).toBe('waiting');

    patientBRequestId = response.data.id;
  });

  it('lista somente as filas do paciente conectado', async () => {
    const response = await patientA.get('/api/appointment-request');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);

    const ids = response.data.map((request: { id: number }) => request.id);
    expect(ids).toContain(patientARequestId);
    expect(ids).not.toContain(patientBRequestId);

    expect(
      response.data.every(
        (request: { patientId: number }) => request.patientId === patientAId,
      ),
    ).toBe(true);
  });

  it('impede consultar fila pertencente a outro paciente', async () => {
    await expectHttpStatus(
      patientB.get(`/api/appointment-request/${patientARequestId}`),
      404,
    );
  });

  it('impede sair da fila pertencente a outro paciente', async () => {
    await expectHttpStatus(
      patientB.delete(`/api/appointment-request/${patientARequestId}`),
      404,
    );

    const ownRequest = await patientA.get(
      `/api/appointment-request/${patientARequestId}`,
    );
    expect(ownRequest.data.status).toBe('waiting');
  });

  it('permite ao paciente sair somente da própria fila', async () => {
    const response = await patientA.delete(
      `/api/appointment-request/${patientARequestId}`,
    );

    expect([200, 204]).toContain(response.status);

    const cancelled = await patientA.get(
      `/api/appointment-request/${patientARequestId}`,
    );
    expect(cancelled.data.patientId).toBe(patientAId);
    expect(cancelled.data.status).toBe('cancelled');
  });
});
