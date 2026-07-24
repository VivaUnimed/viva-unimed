import {
  deleteRequest,
  getRequest,
  postRequest,
} from './api';

/**
 * Lê os dados do usuário salvos durante o login.
 */
const readStoredUser = () => {
  const rawUser =
    localStorage.getItem('user') ||
    sessionStorage.getItem('user');

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

/**
 * Tenta descobrir o ID do paciente.
 *
 * É importante diferenciar:
 *
 * user.id    = ID da tabela users
 * patientId  = ID da tabela patients
 */
const getPatientId = ({ required = true } = {}) => {
  const user = readStoredUser();

  const storedPatientId =
    localStorage.getItem('patientId') ||
    sessionStorage.getItem('patientId');

  const patientId =
    user?.patientId ??
    user?.patient?.id ??
    user?.paciente?.id ??
    storedPatientId;

  const numericPatientId = Number(patientId);

  if (
    !Number.isInteger(numericPatientId) ||
    numericPatientId <= 0
  ) {
    if (required) {
      throw new Error(
        'ID do paciente não encontrado. O login ainda não retorna patientId.',
      );
    }

    return null;
  }

  return numericPatientId;
};

/**
 * Extrai uma lista independentemente do formato
 * utilizado pela resposta do backend.
 */
const extractList = (
  payload,
  propertyNames = [],
) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const propertyName of propertyNames) {
    if (Array.isArray(payload?.[propertyName])) {
      return payload[propertyName];
    }
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

/**
 * Normaliza uma especialidade para o formato
 * utilizado pela página.
 */
const normalizeSpeciality = (
  speciality = {},
  activeRequests = [],
) => {
  const specialityId =
    speciality.id ??
    speciality.specialityId ??
    speciality.especialidadeId;

  /*
   * Verifica se já existe uma solicitação
   * waiting para esta especialidade.
   */
  const activeRequest = activeRequests.find(
    (request) =>
      Number(request.specialityId) ===
        Number(specialityId) &&
      request.status === 'waiting',
  );

  return {
    id: specialityId ?? '',

    name:
      speciality.name ??
      speciality.nome ??
      speciality.description ??
      'Especialidade sem nome',

    status: activeRequest
      ? 'NA FILA'
      : 'ESPECIALIDADE',

    selected: Boolean(activeRequest),

    queued: Boolean(activeRequest),

    /*
     * Para sair da fila, o DELETE precisa receber
     * o ID de appointment_request, e não o ID
     * da especialidade.
     */
    requestId: activeRequest?.id ?? null,

    iconName:
      speciality.iconName ??
      speciality.icon ??
      '',
  };
};

/**
 * Carrega:
 *
 * 1. Todas as especialidades;
 * 2. As filas atuais do paciente.
 */
export const getInteresses = async () => {
  try {
    const specialitiesResponse =
      await getRequest('/api/speciality');

    const specialities = extractList(
      specialitiesResponse,
      [
        'specialities',
        'specialties',
        'especialidades',
        'items',
      ],
    );

    const patientId = getPatientId({
      required: false,
    });

    let activeRequests = [];

    if (patientId) {
      const requestsResponse = await getRequest(
        `/api/appointment-request?patientId=${patientId}&status=waiting`,
      );

      activeRequests = extractList(
        requestsResponse,
        [
          'requests',
          'appointmentRequests',
          'items',
        ],
      );
    }

    return specialities
      .map((speciality) =>
        normalizeSpeciality(
          speciality,
          activeRequests,
        ),
      )
      .filter(
        (speciality) =>
          speciality.id &&
          speciality.name,
      )
      .sort((a, b) =>
        a.name.localeCompare(
          b.name,
          'pt-BR',
        ),
      );
  } catch (error) {
    console.error(
      'Erro ao carregar interesses:',
      error,
    );

    throw new Error(
      error?.message ||
        'Não foi possível carregar as especialidades.',
    );
  }
};

/**
 * Insere o paciente na fila de uma especialidade.
 */
export const addInteresse = async (
  specialityId,
) => {
  try {
    const patientId = getPatientId();

    const payload = {
      patientId,
      specialityId: Number(specialityId),
      status: 'waiting',

      /*
       * O backend exige date.
       *
       * Como a tela atual não possui uma data
       * preferencial, usamos a data atual.
       */
      date: new Date().toISOString(),
    };

    return await postRequest(
      '/api/appointment-request',
      payload,
    );
  } catch (error) {
    console.error(
      'Erro ao entrar na fila:',
      error,
    );

    throw new Error(
      error?.message ||
        'Não foi possível entrar na fila.',
    );
  }
};

/**
 * Remove uma solicitação de fila.
 *
 * Este parâmetro é o ID de appointment_request,
 * não o ID da especialidade.
 */
export const removeInteresse = async (
  requestId,
) => {
  try {
    if (!requestId) {
      throw new Error(
        'Solicitação da fila não encontrada.',
      );
    }

    return await deleteRequest(
      `/api/appointment-request/${requestId}`,
    );
  } catch (error) {
    console.error(
      'Erro ao sair da fila:',
      error,
    );

    throw new Error(
      error?.message ||
        'Não foi possível sair da fila.',
    );
  }
};