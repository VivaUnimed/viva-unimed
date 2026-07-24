import {
  getRequest,
  postRequest,
} from './api';

/**
 * Retorna os matchIds guardados temporariamente
 * no navegador.
 */
const getStoredMatchIds = () => {
  const ids = [];

  const singleMatchId =
    localStorage.getItem('matchId') ||
    sessionStorage.getItem('matchId');

  const storedMatchIds =
    localStorage.getItem('matchIds') ||
    sessionStorage.getItem('matchIds');

  if (singleMatchId) {
    ids.push(singleMatchId);
  }

  if (storedMatchIds) {
    try {
      const parsed = JSON.parse(
        storedMatchIds,
      );

      if (Array.isArray(parsed)) {
        ids.push(...parsed);
      }
    } catch {
      ids.push(
        ...String(storedMatchIds).split(','),
      );
    }
  }

  return [
    ...new Set(
      ids
        .map((id) => Number(id))
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0,
        ),
    ),
  ];
};

const removeStoredMatchId = (
  matchId,
) => {
  const numericMatchId =
    Number(matchId);

  const remainingIds =
    getStoredMatchIds().filter(
      (id) => id !== numericMatchId,
    );

  localStorage.removeItem('matchId');
  sessionStorage.removeItem('matchId');

  localStorage.setItem(
    'matchIds',
    JSON.stringify(remainingIds),
  );

  sessionStorage.removeItem('matchIds');
};

const unwrapResponse = (response) => {
  return (
    response?.data ??
    response?.match ??
    response
  );
};

const formatDate = (value) => {
  if (!value) {
    return 'Data não informada';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data não informada';
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle: 'short',
    },
  ).format(date);
};

const formatTime = (value) => {
  if (!value) {
    return '--:--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(date);
};

const isExpired = (expiresAt) => {
  if (!expiresAt) {
    return false;
  }

  const timestamp =
    new Date(expiresAt).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return timestamp <= Date.now();
};

const isUrgent = (expiresAt) => {
  if (!expiresAt) {
    return false;
  }

  const timestamp =
    new Date(expiresAt).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  const remainingTime =
    timestamp - Date.now();

  return (
    remainingTime > 0 &&
    remainingTime <=
      5 * 60 * 1000
  );
};

const getDoctorName = (
  appointment = {},
) => {
  return (
    appointment?.doctor?.user?.name ??
    appointment?.doctor?.name ??
    appointment?.doctorName ??
    (
      appointment?.doctorId
        ? `Profissional #${appointment.doctorId}`
        : 'Profissional não informado'
    )
  );
};

const getSpecialityName = (
  appointment = {},
) => {
  return (
    appointment?.speciality?.name ??
    appointment?.speciality?.description ??
    appointment?.specialityName ??
    (
      appointment?.specialityId
        ? `Especialidade #${appointment.specialityId}`
        : 'Especialidade não informada'
    )
  );
};

/**
 * Carrega uma oferta pelo ID.
 */
export const getMatchById = async (
  matchId,
) => {
  const response = await getRequest(
    `/api/match/${matchId}`,
  );

  return unwrapResponse(response);
};

/**
 * Carrega as vagas que estão esperando
 * uma resposta do paciente.
 */
export const getVagasTempoReal =
  async () => {
    const matchIds =
      getStoredMatchIds();

    console.log(
      'Match IDs encontrados:',
      matchIds,
    );

    if (matchIds.length === 0) {
      return [];
    }

    const vagas = await Promise.all(
      matchIds.map(async (matchId) => {
        try {
          const match =
            await getMatchById(matchId);

          const status = String(
            match?.status ?? '',
          )
            .trim()
            .toLowerCase();

          const expired = isExpired(
            match?.expiresAt,
          );

          console.log(
            `Match ${matchId}:`,
            {
              status,
              expiresAt:
                match?.expiresAt,
              expired,
            },
          );

          if (
            status !==
              'waiting_response' ||
            expired
          ) {
            return null;
          }

          /*
           * Algumas respostas de match não
           * trazem o appointment completo.
           */
          let appointment =
            match?.appointment ??
            null;

          if (
            !appointment &&
            match?.appointmentId
          ) {
            const appointmentResponse =
              await getRequest(
                `/api/appointment/${match.appointmentId}`,
              );

            appointment =
              unwrapResponse(
                appointmentResponse,
              );
          }

          const urgent = isUrgent(
            match?.expiresAt,
          );

          return {
            id: match.id,
            matchId: match.id,

            appointmentId:
              match.appointmentId ??
              appointment?.id,

            medico:
              getDoctorName(
                appointment,
              ),

            especialidade:
              getSpecialityName(
                appointment,
              ),

            horario:
              formatTime(
                appointment?.date,
              ),

            dataFormatada:
              formatDate(
                appointment?.date,
              ),

            expiresAt:
              match.expiresAt,

            urgente: urgent,

            variant: urgent
              ? 'urgent'
              : 'success',

            original: match,
          };
        } catch (error) {
          console.error(
            `Erro ao carregar match ${matchId}:`,
            error,
          );

          return null;
        }
      }),
    );

    const normalizedVagas =
      vagas.filter(Boolean);

    console.log(
      'Vagas retornadas pelo alarmesApi:',
      normalizedVagas,
    );

    /*
     * ESTE RETURN É O PONTO MAIS IMPORTANTE.
     */
    return normalizedVagas;
  };

/**
 * Confirma uma vaga.
 */
export const aceitarVaga = async (
  matchId,
) => {
  if (!matchId) {
    throw new Error(
      'ID da oferta não encontrado.',
    );
  }

  const response = await postRequest(
    `/api/match/${matchId}/confirm`,
    {},
  );

  removeStoredMatchId(matchId);

  return response;
};

/**
 * Recusa uma vaga.
 */
export const recusarVaga = async (
  matchId,
) => {
  if (!matchId) {
    throw new Error(
      'ID da oferta não encontrado.',
    );
  }

  const response = await postRequest(
    `/api/match/${matchId}/reject`,
    {},
  );

  removeStoredMatchId(matchId);

  return response;
};

/**
 * Funções mantidas para compatibilidade
 * com outras páginas.
 */
export const getTodasNotificacoes =
  async () => {
    const vagas =
      await getVagasTempoReal();

    return {
      urgentes: vagas.filter(
        ({ urgente }) => urgente,
      ),
      consultas: [],
      vagas,
      exames: [],
      informativos: [],
    };
  };

export const getAlertaUrgente =
  async () => {
    const vagas =
      await getVagasTempoReal();

    return (
      vagas.find(
        ({ urgente }) => urgente,
      ) ?? null
    );
  };

export const getAlertasUrgentes =
  async () => {
    const vagas =
      await getVagasTempoReal();

    return vagas.filter(
      ({ urgente }) => urgente,
    );
  };

export const getNotificacoesConsultas =
  async () => [];

export const getResultadosExames =
  async () => [];

export const getInformativos =
  async () => [];

export const getNotificacoesRecentes =
  async () => {
    return getAlertasUrgentes();
  };