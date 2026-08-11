import {
  deleteRequest,
  getRequest,
  postRequest,
} from './api';

/**
 * Converte diferentes formatos
 * de resposta em uma lista.
 */
const extractList = (
  payload,
  propertyNames = [],
) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (
    const propertyName
    of propertyNames
  ) {
    if (
      Array.isArray(
        payload?.[propertyName],
      )
    ) {
      return payload[propertyName];
    }
  }

  if (
    Array.isArray(payload?.data)
  ) {
    return payload.data;
  }

  return [];
};

/**
 * Converte uma especialidade
 * para o formato utilizado
 * pela página Interesses.
 */
const normalizeSpeciality = (
  speciality = {},
  activeRequests = [],
) => {
  const specialityId =
    speciality.id ??
    speciality.specialityId ??
    speciality.especialidadeId;

  const activeRequest =
    activeRequests.find(
      (request) =>
        Number(
          request.specialityId,
        ) ===
          Number(
            specialityId,
          ) &&
        request.status ===
          'waiting',
    );

  return {
    id:
      specialityId ??
      '',

    name:
      speciality.name ??
      speciality.nome ??
      speciality.description ??
      'Especialidade sem nome',

    status:
      activeRequest
        ? 'NA FILA'
        : 'ESPECIALIDADE',

    selected:
      Boolean(activeRequest),

    queued:
      Boolean(activeRequest),

    requestId:
      activeRequest?.id ??
      null,

    iconName:
      speciality.iconName ??
      '',
  };
};

/**
 * Busca as especialidades
 * disponíveis e as filas
 * do paciente autenticado.
 *
 * O backend identifica o
 * paciente pelo JWT.
 */
export const getInteresses =
  async () => {
    try {
      const [
        specialitiesResponse,
        requestsResponse,
      ] = await Promise.all([
        getRequest(
          '/api/speciality',
        ),

        /**
         * NÃO enviamos patientId.
         *
         * O backend pega o paciente
         * através do JWT.
         */
        getRequest(
          '/api/appointment-request/me?status=waiting',
        ),
      ]);

      const specialities =
        extractList(
          specialitiesResponse,
          [
            'specialities',
            'specialties',
            'especialidades',
            'items',
          ],
        );

      const activeRequests =
        extractList(
          requestsResponse,
          [
            'requests',
            'appointmentRequests',
            'items',
          ],
        );

      return specialities
        .map(
          (speciality) =>
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
        .sort(
          (a, b) =>
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
 * Entra na fila.
 *
 * O patientId NÃO é enviado.
 * O status NÃO é enviado.
 * attempts NÃO é enviado.
 * cooldownUntil NÃO é enviado.
 *
 * Tudo isso é controlado
 * pelo backend.
 */
export const addInteresse =
  async (
    specialityId,
  ) => {
    try {
      const numericSpecialityId =
        Number(specialityId);

      if (
        !Number.isInteger(
          numericSpecialityId,
        ) ||
        numericSpecialityId <= 0
      ) {
        throw new Error(
          'Especialidade inválida.',
        );
      }

      return await postRequest(
        '/api/appointment-request/me',

        {
          specialityId:
            numericSpecialityId,

          /**
           * O tipo atual do shared
           * ainda exige date.
           */
          date:
            new Date()
              .toISOString(),
        },
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
 * Sai da fila.
 *
 * O backend verifica se
 * requestId realmente pertence
 * ao paciente autenticado.
 */
export const removeInteresse =
  async (
    requestId,
  ) => {
    try {
      const numericRequestId =
        Number(requestId);

      if (
        !Number.isInteger(
          numericRequestId,
        ) ||
        numericRequestId <= 0
      ) {
        throw new Error(
          'Solicitação da fila não encontrada.',
        );
      }

      return await deleteRequest(
         `/api/appointment-request/me/${numericRequestId}`,
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