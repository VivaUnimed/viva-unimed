import { client } from './client'
import { describe, it, expect, beforeAll } from 'vitest'

describe('cria vaga de consulta', () => { // Dica: Talvez renomear para 'appointment request controller'
  let userIdDoct: number;
  let userIdPat: number;
  let doctorId: number;
  let specialityId: number;
  let patientId: number;
  let appointmentRequestId: number;

  beforeAll(async () => {
    await client.login();

    const userResDoct = await client.post('/api/user', {
      name: 'Médico Teste 3',
      email: `medico.teste3.${Date.now()}@example.com`,
    });
    userIdDoct = userResDoct.data.id;

    const doctRes = await client.post('/api/doctor', {
      userId: userIdDoct,
      crm: '1234567-RS',
      enabled: true,
    });
    doctorId = doctRes.data.id;

    const specRes = await client.post('/api/speciality', {
      name: 'Neurologista',
    });
    specialityId = specRes.data.id;

    await client.post(`/api/doctor/${doctorId}/speciality`, {
      specialityId: specialityId
    });

    const userResPat = await client.post('/api/user', {
      name: 'Paciente Teste 3',
      email: `paciente.teste.${Date.now()}@example.com`,
    });
    userIdPat = userResPat.data.id;

    const patientRes = await client.post('/api/patient', {
      userId: userIdPat,
      birth: '1997-05-15',
    });
    patientId = patientRes.data.id;
  });

  it('cria solicitação de consulta', async () => {
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 1);
    const dataConsulta = dataFutura.toISOString();

    const res = await client.post('/api/appointment-request', {
      patientId: patientId,
      specialityId: specialityId,
      doctorId: doctorId,
      status: "waiting",
      date: dataConsulta,
      attempts: 0,
      cooldownUntil: dataConsulta
    });

    expect(res.status).toBe(200);

    expect(res.data.id).toBeDefined();
    expect(res.data.patientId).toBe(patientId);
    expect(res.data.specialityId).toBe(specialityId);
    expect(res.data.status).toBe("waiting");

    appointmentRequestId = res.data.id;
  });

  it('lista interesses de consultas', async () => {
    const res = await client.get('/api/appointment-request');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);

    const createdAppointmentReqIsInList = res.data.some((app: any) => app.id === appointmentRequestId);
    expect(createdAppointmentReqIsInList).toBe(true);
  });

  it('atualiza solicitação de consulta', async () => {
    //nova data pra simular a alteração jogando pra daqui a 2 dias
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 2);
    const novaDataConsulta = dataFutura.toISOString();

    const res = await client.put(`/api/appointment-request/${appointmentRequestId}`, {
      patientId: patientId,
      specialityId: specialityId,
      doctorId: doctorId,
      status: "approved",
      date: novaDataConsulta,
      attempts: 1,
      cooldownUntil: novaDataConsulta
    });

    expect(res.status).toBe(200);

    expect(res.data.status).toBe("approved");
    expect(res.data.attempts).toBe(1);
  });

  it('busca requisição de consulta por id', async () => {
    const res = await client.get(`/api/appointment-request/${appointmentRequestId}`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('id', appointmentRequestId);
    expect(res.data).toHaveProperty('patientId', patientId);
    expect(res.data).toHaveProperty('doctorId', doctorId);
    expect(res.data).toHaveProperty('specialityId', specialityId);
    expect(res.data).toHaveProperty('status', "approved");
    expect(res.data).toHaveProperty('attempts', 1);
    expect(res.data).toHaveProperty('date');
  });

  it('exclui requisição de consulta', async () => {
    // cria uma nova requisição (status waiting) apenas para deletar
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 5);

    const createRes = await client.post('/api/appointment-request', {
      patientId: patientId,
      specialityId: specialityId,
      doctorId: doctorId,
      status: "waiting",
      date: dataFutura.toISOString(),
      attempts: 0,
      cooldownUntil: dataFutura.toISOString()
    });

    const requestToDelete = createRes.data.id;

    // exclui a requisição que acabou de ser criada
    const res = await client.delete(`/api/appointment-request/${requestToDelete}`);

    //valida se a exclusão foi um sucesso
    expect([200, 204]).toContain(res.status);
  });

});
