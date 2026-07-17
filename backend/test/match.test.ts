import { client } from './client'
import { describe, it, expect, beforeAll } from 'vitest'

describe('Match Controller', () => {
  let doctorUserId: number;
  let doctorId: number;
  let specialityId: number;

  let patientUserId: number;
  let patientId: number;

  let appointmentId: number;
  let requestId: number;
  let matchId: number;

  beforeAll(async () => {
    await client.login();

    // cria Especialidade
    const specRes = await client.post('/api/speciality', {
      name: `Cardiologia Match ${Date.now()}`,
    });
    specialityId = specRes.data.id;

    // cria Médico e vincula especialidade
    const userDoctRes = await client.post('/api/user', {
      name: 'Médico Match',
      email: `medico.match.${Date.now()}@example.com`,
    });
    doctorUserId = userDoctRes.data.id;

    const doctRes = await client.post('/api/doctor', {
      userId: doctorUserId,
      crm: `99999-RS`,
      enabled: true,
    });
    doctorId = doctRes.data.id;

    await client.post(`/api/doctor/${doctorId}/speciality`, {
      specialityId: specialityId
    });

    // cria Paciente
    const userPatRes = await client.post('/api/user', {
      name: 'Paciente Match',
      email: `paciente.match.${Date.now()}@example.com`,
    });
    patientUserId = userPatRes.data.id;

    const patRes = await client.post('/api/patient', {
      userId: patientUserId,
      birth: '1990-01-01',
    });
    patientId = patRes.data.id;

    // cria vaga de consulta
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 2);
    const appRes = await client.post('/api/appointment', {
      date: dataFutura.toISOString(),
      doctorId,
      specialityId
    });
    appointmentId = appRes.data.id;

    // cria pedido de encaixe/fila
    const dataDesejada = new Date();
    dataDesejada.setDate(dataDesejada.getDate() + 5);

    const reqRes = await client.post('/api/appointment-request', {
      patientId,
      specialityId,
      status: 'waiting',
      date: dataDesejada.toISOString()
    });
    requestId = reqRes.data.id;

    //gera o match
   const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 15); // Expira em 15 minutos

    try {
      const matchRes = await client.post('/api/match/', {
        appointmentId,
        requestId,
        status: 'waiting_response', // Status inicial padrão
        expiresAt: expireDate.toISOString()
      });
      matchId = matchRes.data.id;
    } catch (error: any) {
      console.log('🔥 DETALHES DO ERRO 500:', error.response?.data || error.message);
      throw error;
    }
  });

  // it('lista todos os matches', async () => {
  //   try {
  //     const res = await client.get('/api/match');

  //     expect(res.status).toBe(200);
  //     expect(Array.isArray(res.data)).toBe(true);
  //     expect(res.data.length).toBeGreaterThan(0);

  //     const createdMatchIsInList = res.data.some((m: any) => m.id === matchId);
  //     expect(createdMatchIsInList).toBe(true);

  //   } catch (error: any) {
  //     console.log('🔥 DETALHES DO ERRO LISTA MATCHES:', error.response?.data || error.message);
  //     throw error;
  //   }
  // });

  it('busca match por id', async () => {
    const res = await client.get(`/api/match/${matchId}`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('id', matchId);
    expect(res.data).toHaveProperty('appointmentId', appointmentId);
    expect(res.data).toHaveProperty('requestId', requestId);
    expect(res.data).toHaveProperty('status');
  });

  it('rejeita um match', async () => {
    const res = await client.post(`/api/match/${matchId}/reject`);

    expect([200, 204]).toContain(res.status);

    const checkRes = await client.get(`/api/match/${matchId}`);
    expect(checkRes.data.status).toBe('rejected');
  });

 it('cancela um match', async () => {
  try {
    // Cria um paciente totalmente novo para não conflitar com a fila
    const userPatRes = await client.post('/api/user', {
      name: `Paciente Cancel ${Date.now()}`,
      email: `paciente.cancel.${Date.now()}@example.com`,
    });
    const patRes = await client.post('/api/patient', {
      userId: userPatRes.data.id,
      birth: '1990-01-01',
    });
    const newPatientId = patRes.data.id;

    // Nova Vaga e Novo Pedido
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 3);

    const appRes = await client.post('/api/appointment', { date: dataFutura.toISOString(), doctorId, specialityId });
    const newAppId = appRes.data.id;

    const reqRes = await client.post('/api/appointment-request', { patientId: newPatientId, specialityId, priority: 'normal', status: 'waiting', date: dataFutura.toISOString() });
    const newReqId = reqRes.data.id;

    // cria o match para este cenário
    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 15);

    const newMatchRes = await client.post('/api/match/', {
      appointmentId: newAppId,
      requestId: newReqId,
      status: 'waiting_response',
      expiresAt: expireDate.toISOString()
    });
    const matchToCancel = newMatchRes.data.id;

    // testa o cancelamento

    await client.post(`/api/match/${matchToCancel}/confirm`);

    const res = await client.post(`/api/match/${matchToCancel}/cancel`);
    expect([200, 204]).toContain(res.status);

  } catch (error: any) {
      console.log('🔥 DETALHES DO ERRO 500:', error.response?.data || error.message);
      throw error;
  }
  });

  it('confirma um match', async () => {
    // cria um paciente totalmente novo para não conflitar com a fila
    const userPatRes = await client.post('/api/user', {
      name: `Paciente Confirm ${Date.now()}`,
      email: `paciente.confirm.${Date.now()}@example.com`,
    });
    const patRes = await client.post('/api/patient', {
      userId: userPatRes.data.id,
      birth: '1990-01-01',
    });
    const newPatientId = patRes.data.id;

    // nova Vaga e Novo Pedido
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 4);

    const appRes = await client.post('/api/appointment', { date: dataFutura.toISOString(), doctorId, specialityId });
    const newAppId = appRes.data.id;

    const reqRes = await client.post('/api/appointment-request', { patientId: newPatientId, specialityId, priority: 'normal', status: 'waiting', date: dataFutura.toISOString() });
    const newReqId = reqRes.data.id;

    // cria o match para este cenário
    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 15);

    const newMatchRes = await client.post('/api/match/', {
      appointmentId: newAppId,
      requestId: newReqId,
      status: 'waiting_response',
      expiresAt: expireDate.toISOString()
    });
    const matchToConfirm = newMatchRes.data.id;

    // testa a confirmação
    const res = await client.post(`/api/match/${matchToConfirm}/confirm`);
    expect([200, 204]).toContain(res.status);
  });
});
