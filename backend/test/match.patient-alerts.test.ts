import { AxiosError } from 'axios';
import { beforeAll, describe, expect, it } from 'vitest';
import { client } from './client';

/** Gera um CPF matematicamente válido a partir de nove dígitos. */
function generateCpf(seed: string): string {
  const digits = seed.replace(/\D/g, '').padStart(9, '0').slice(-9).split('').map(Number);

  const calculateDigit = (values: number[]): number => {
    const sum = values.reduce(
      (total, value, index) => total + value * (values.length + 1 - index),
      0,
    );
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  digits.push(calculateDigit(digits));
  digits.push(calculateDigit(digits));
  return digits.join('');
}

function getHttpDetails(error: unknown) {
  if (!(error instanceof AxiosError)) return error;

  return {
    status: error.response?.status,
    data: error.response?.data,
    method: error.config?.method,
    url: error.config?.url,
  };
}

/**
 * Testes do endpoint de alertas/matches do paciente autenticado.
 *
 * O arquivo usa dados exclusivos em cada execução para evitar HTTP 409
 * causado por e-mail, CPF, CRM ou especialidade já existentes.
 */
describe('Alertas do paciente autenticado', () => {
  const admin = client.create();
  const patientA = client.create();
  const patientB = client.create();

  const patientAPassword = 'Paciente@123';
  const patientBPassword = 'Paciente@456';
  const runId = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const suffix = runId.slice(-8);

  const specialityName = `Cardiologia Alertas ${runId}`;
  const doctorName = `Médico dos Alertas ${suffix}`;
  const doctorEmail = `medico.alertas.${runId}@example.com`;
  const patientAEmail = `paciente.a.alertas.${runId}@example.com`;
  const patientBEmail = `paciente.b.alertas.${runId}@example.com`;

  let doctorId: number;
  let specialityId: number;
  let patientAId: number;
  let patientBId: number;
  let offerSequence = 0;

  beforeAll(async () => {
    try {
      await admin.login();

      const specialityResponse = await admin.post('/api/speciality', {
        name: specialityName,
      });
      expect(specialityResponse.data.id).toBeDefined();
      specialityId = specialityResponse.data.id;

      const doctorResponse = await admin.post('/api/doctor', {
        name: doctorName,
        email: doctorEmail,
        cpf: generateCpf(`1${suffix}`),
        phone: `519${suffix}`.slice(0, 11),
        password: 'Medico@123',
        crm: `CRM-${suffix}`,
      });
      expect(doctorResponse.data.id).toBeDefined();
      doctorId = doctorResponse.data.id;

      await admin.post(`/api/doctor/${doctorId}/speciality`, {
        specialityId,
      });

      const patientAResponse = await admin.post('/api/patient', {
        name: `Paciente A Alertas ${suffix}`,
        email: patientAEmail,
        cpf: generateCpf(`2${suffix}`),
        birth: '1990-01-01',
        password: patientAPassword,
      });
      expect(patientAResponse.data.id).toBeDefined();
      patientAId = patientAResponse.data.id;

      const patientBResponse = await admin.post('/api/patient', {
        name: `Paciente B Alertas ${suffix}`,
        email: patientBEmail,
        cpf: generateCpf(`3${suffix}`),
        birth: '1992-02-02',
        password: patientBPassword,
      });
      expect(patientBResponse.data.id).toBeDefined();
      patientBId = patientBResponse.data.id;

      await patientA.login(patientAEmail, patientAPassword);
      await patientB.login(patientBEmail, patientBPassword);
    } catch (error) {
      console.error('Falha ao preparar os dados do teste:', getHttpDetails(error));
      throw error;
    }
  });

  async function createOffer(
    patientId: number,
    options: {
      matchStatus?: 'queued' | 'waiting_response';
      expiresAt?: Date;
      appointmentDate?: Date;
    } = {},
  ) {
    try {
      offerSequence += 1;

      const appointmentDate =
        options.appointmentDate ??
        new Date(
          Date.now() +
            48 * 60 * 60 * 1000 +
            offerSequence * 60 * 60 * 1000,
        );

      const expiresAt =
        options.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000);

      /*
       * A regra da aplicação permite somente uma solicitação ativa por
       * paciente e especialidade. Cada cenário usa uma especialidade própria
       * para que os testes não provoquem HTTP 409 entre si.
       */
      const offerSpecialityResponse = await admin.post('/api/speciality', {
        name: `Especialidade Alerta ${runId}-${offerSequence}`,
      });
      const offerSpecialityId = offerSpecialityResponse.data.id as number;

      await admin.post(`/api/doctor/${doctorId}/speciality`, {
        specialityId: offerSpecialityId,
      });

      const appointmentResponse = await admin.post('/api/appointment', {
        date: appointmentDate.toISOString(),
        doctorId,
        specialityId: offerSpecialityId,
      });

      const requestOwner = patientId === patientAId ? patientA : patientB;
      const requestResponse = await requestOwner.post('/api/appointment-request', {
        specialityId: offerSpecialityId,
        date: appointmentDate.toISOString(),
      });

      const matchResponse = await admin.post('/api/match', {
        appointmentId: appointmentResponse.data.id,
        requestId: requestResponse.data.id,
        status: options.matchStatus ?? 'waiting_response',
        expiresAt: expiresAt.toISOString(),
      });

      return {
        matchId: matchResponse.data.id as number,
        appointmentId: appointmentResponse.data.id as number,
        requestId: requestResponse.data.id as number,
        specialityId: offerSpecialityId,
        specialityName: offerSpecialityResponse.data.name as string,
      };
    } catch (error) {
      console.error('Falha ao criar oferta para o teste:', getHttpDetails(error));
      throw error;
    }
  }

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

  it('lista somente ofertas do paciente conectado e inclui consulta, médico e especialidade', async () => {
    const ownOffer = await createOffer(patientAId);
    const otherPatientOffer = await createOffer(patientBId);

    const response = await patientA.get('/api/match/mine');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);

    const ids = response.data.map((match: { id: number }) => match.id);
    expect(ids).toContain(ownOffer.matchId);
    expect(ids).not.toContain(otherPatientOffer.matchId);

    const match = response.data.find(
      (item: { id: number }) => item.id === ownOffer.matchId,
    );

    expect(match).toBeDefined();
    expect(match.status).toBe('waiting_response');
    expect(match.appointment).toMatchObject({
      id: ownOffer.appointmentId,
      doctorId,
      specialityId: ownOffer.specialityId,
    });
    expect(match.appointment.date).toBeDefined();
    expect(match.appointment.doctor).toBeDefined();
    expect(match.appointment.doctor.user.name).toBe(doctorName);
    expect(match.appointment.speciality.id).toBe(ownOffer.specialityId);
    expect(match.appointment.speciality.name).toBe(ownOffer.specialityName);
  });

  it('retorna por padrão apenas ofertas aguardando resposta', async () => {
    const pendingOffer = await createOffer(patientAId);
    const rejectedOffer = await createOffer(patientAId);

    await patientA.post(`/api/match/${rejectedOffer.matchId}/reject`);

    const response = await patientA.get('/api/match/mine');
    const ids = response.data.map((match: { id: number }) => match.id);

    expect(ids).toContain(pendingOffer.matchId);
    expect(ids).not.toContain(rejectedOffer.matchId);
    expect(
      response.data.every((match: { status: string }) =>
        ['queued', 'waiting_response'].includes(match.status),
      ),
    ).toBe(true);
  });

  it('inclui o histórico quando includeHistory=true', async () => {
    const rejectedOffer = await createOffer(patientAId);
    await patientA.post(`/api/match/${rejectedOffer.matchId}/reject`);

    const response = await patientA.get('/api/match/mine?includeHistory=true');
    const match = response.data.find(
      (item: { id: number }) => item.id === rejectedOffer.matchId,
    );

    expect(match).toBeDefined();
    expect(match.status).toBe('rejected');
    expect(match.respondedAt).toBeTruthy();
  });

  it('filtra os alertas pelo status informado', async () => {
    const rejectedOffer = await createOffer(patientAId);
    await patientA.post(`/api/match/${rejectedOffer.matchId}/reject`);

    const response = await patientA.get('/api/match/mine?status=rejected');

    expect(response.data.length).toBeGreaterThan(0);
    expect(
      response.data.every((match: { status: string }) => match.status === 'rejected'),
    ).toBe(true);
    expect(
      response.data.some((match: { id: number }) => match.id === rejectedOffer.matchId),
    ).toBe(true);
  });

  it('impede consultar match pertencente a outro paciente', async () => {
    const offer = await createOffer(patientAId);
    await expectHttpStatus(patientB.get(`/api/match/${offer.matchId}`), 404);
  });

  it('impede aceitar, recusar e cancelar match pertencente a outro paciente', async () => {
    const offer = await createOffer(patientAId);

    await expectHttpStatus(
      patientB.post(`/api/match/${offer.matchId}/confirm`),
      404,
    );
    await expectHttpStatus(
      patientB.post(`/api/match/${offer.matchId}/reject`),
      404,
    );
    await expectHttpStatus(
      patientB.post(`/api/match/${offer.matchId}/cancel`),
      404,
    );
  });

  it('preenche respondedAt ao aceitar uma oferta', async () => {
    const offer = await createOffer(patientAId);

    const confirmResponse = await patientA.post(
      `/api/match/${offer.matchId}/confirm`,
    );
    expect([200, 204]).toContain(confirmResponse.status);

    const response = await patientA.get(`/api/match/${offer.matchId}`);
    expect(response.data.status).toBe('accepted');
    expect(response.data.respondedAt).toBeTruthy();
  });

  it('preenche respondedAt ao recusar uma oferta', async () => {
    const offer = await createOffer(patientAId);

    const rejectResponse = await patientA.post(
      `/api/match/${offer.matchId}/reject`,
    );
    expect([200, 204]).toContain(rejectResponse.status);

    const response = await patientA.get(`/api/match/${offer.matchId}`);
    expect(response.data.status).toBe('rejected');
    expect(response.data.respondedAt).toBeTruthy();
  });

  it('impede o aceite de oferta expirada', async () => {
    const expiredOffer = await createOffer(patientAId, {
      expiresAt: new Date(Date.now() - 60 * 1000),
    });

    await expectHttpStatus(
      patientA.post(`/api/match/${expiredOffer.matchId}/confirm`),
      409,
    );
  });

  it('permite cancelar uma oferta aceita pelo próprio paciente', async () => {
    const offer = await createOffer(patientAId);

    await patientA.post(`/api/match/${offer.matchId}/confirm`);
    const cancelResponse = await patientA.post(
      `/api/match/${offer.matchId}/cancel`,
    );

    expect([200, 204]).toContain(cancelResponse.status);

    const response = await patientA.get(`/api/match/${offer.matchId}`);
    expect(response.data.status).toBe('cancelled');
  });
});
