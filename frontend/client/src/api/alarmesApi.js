import {
  getRequest,
  postRequest,
} from './api';

/**
 * Garante que o retorno seja tratado como array.
 */
const extractList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.matches)) {
    return data.matches;
  }

  return [];
};

/**
 * Converte uma data para um objeto Date válido.
 */
const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/**
 * Formata somente a data.
 * Exemplo: 17/08/2026
 */
const formatDate = (value) => {
  const date = parseDate(value);

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Formata somente o horário.
 * Exemplo: 18:15
 */
const formatTime = (value) => {
  const date = parseDate(value);

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Normaliza o match retornado pelo backend
 * para o formato usado no frontend.
 */
const normalizeVaga = (match = {}) => {
  const appointment =
    match.appointment ??
    match.Appointment ??
    {};

  const speciality =
    appointment.speciality ??
    appointment.Speciality ??
    match.speciality ??
    {};

  const doctor =
    appointment.doctor ??
    appointment.Doctor ??
    {};

  const doctorUser =
    doctor.user ??
    doctor.User ??
    {};

  const appointmentDate =
    appointment.date ??
    match.date ??
    null;

  return {
    // ID do appointment_match.
    // É este ID que usamos para aceitar/recusar.
    id:
      match.id ??
      match.matchId ??
      '',

    matchId:
      match.id ??
      match.matchId ??
      '',

    requestId:
      match.requestId ??
      null,

    appointmentId:
      match.appointmentId ??
      appointment.id ??
      null,

    status:
      match.status ??
      '',

    expiresAt:
      match.expiresAt ??
      null,

    // Dados da consulta.
    date:
      appointmentDate,

    data:
      formatDate(appointmentDate),

    horario:
      formatTime(appointmentDate),

    dataResumo:
      appointmentDate
        ? `${formatDate(appointmentDate)} às ${formatTime(appointmentDate)}`
        : '',

    // Especialidade.
    especialidade:
      speciality.name ??
      speciality.nome ??
      'Especialidade não informada',

    specialityId:
      appointment.specialityId ??
      speciality.id ??
      null,

    // Médico.
    medico:
      doctorUser.name ??
      doctor.name ??
      'Profissional',

    doctorId:
      appointment.doctorId ??
      doctor.userId ??
      doctor.id ??
      null,

    crm:
      doctor.crm ??
      '',

    appointmentStatus:
      appointment.status ??
      '',

    // Ainda não existe informação de local
    // no retorno atual do backend.
    local:
      appointment.location ??
      appointment.local ??
      'Local não informado',
  };
};

/**
 * GET /api/match/mine
 *
 * Busca somente as ofertas de vaga
 * pertencentes ao paciente autenticado.
 */
export const getVagasTempoReal = async () => {
  try {
    const response = await getRequest(
      '/api/match/mine',
    );

    const matches = extractList(response);

    const now = Date.now();

    return matches
      .filter((match) => {
        /**
         * O backend novo já deve retornar
         * waiting_response, mas mantemos essa
         * validação também no frontend.
         */
        if (
          match.status &&
          match.status !== 'waiting_response'
        ) {
          return false;
        }

        /**
         * Não mostra vaga expirada.
         */
        if (match.expiresAt) {
          const expiration =
            new Date(match.expiresAt).getTime();

          if (
            !Number.isNaN(expiration) &&
            expiration <= now
          ) {
            return false;
          }
        }

        return true;
      })
      .map(normalizeVaga);
  } catch (error) {
    console.error(
      'Erro ao carregar vagas em tempo real:',
      error,
    );

    throw new Error(
      error?.message ||
        'Não foi possível carregar as vagas disponíveis.',
    );
  }
};

/**
 * POST /api/match/:matchId/confirm
 *
 * Paciente aceita a vaga.
 */
export const aceitarVaga = async (
  matchId,
) => {
  if (!matchId) {
    throw new Error(
      'ID da oferta não encontrado.',
    );
  }

  try {
    return await postRequest(
      `/api/match/${matchId}/confirm`,
      {},
    );
  } catch (error) {
    console.error(
      'Erro ao aceitar vaga:',
      error,
    );

    throw new Error(
      error?.message ||
        'Não foi possível aceitar a vaga.',
    );
  }
};

/**
 * POST /api/match/:matchId/reject
 *
 * Paciente recusa a vaga.
 */
export const recusarVaga = async (
  matchId,
) => {
  if (!matchId) {
    throw new Error(
      'ID da oferta não encontrado.',
    );
  }

  try {
    return await postRequest(
      `/api/match/${matchId}/reject`,
      {},
    );
  } catch (error) {
    console.error(
      'Erro ao recusar vaga:',
      error,
    );

    throw new Error(
      error?.message ||
        'Não foi possível recusar a vaga.',
    );
  }
};

/**
 * Mantemos estes métodos porque outras telas
 * podem ainda importá-los.
 *
 * Por enquanto, o backend novo disponibiliza
 * as ofertas através de /api/match/mine.
 */
export const getTodasNotificacoes = async () => {
  const vagas = await getVagasTempoReal();

  return {
    urgentes: [],
    consultas: [],
    vagas,
    exames: [],
    informativos: [],
  };
};

export const getAlertaUrgente = async () => {
  return null;
};

export const getAlertasUrgentes = async () => {
  return [];
};

export const getNotificacoesConsultas =
  async () => {
    return [];
  };

export const getResultadosExames =
  async () => {
    return [];
  };

export const getInformativos = async () => {
  return [];
};

export const getNotificacoesRecentes =
  async () => {
    return [];
  };