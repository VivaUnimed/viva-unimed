const vacancyStatusLabels = {
  open: 'Aberta',
  booked: 'Reservada',
  expired: 'Expirada',
  cancelled: 'Cancelada',
  no_show: 'No-show',
};

const vacancyStatusDescriptions = {
  open:
    'A vaga está disponível para novos atendimentos.',
  booked:
    'A vaga já foi reservada e não está mais disponível para novos encaminhamentos.',
  expired:
    'O horário da vaga expirou sem reserva confirmada.',
  cancelled:
    'A vaga foi cancelada e permanece disponível para consulta.',
  no_show:
    'A vaga teve registro de não comparecimento.',
};

const normalizeId = (value) => Number(value);

const toValidDate = (value) => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

const formatLocalDateKey = (value) => {
  const parsedDate = toValidDate(value);

  if (!parsedDate) {
    return String(value ?? '');
  }

  const year = String(parsedDate.getFullYear());
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const sortRequestsByDate = (firstRequest, secondRequest) => {
  const firstTimestamp = toValidDate(firstRequest?.date)?.getTime() ?? 0;
  const secondTimestamp = toValidDate(secondRequest?.date)?.getTime() ?? 0;

  if (firstTimestamp !== secondTimestamp) {
    return firstTimestamp - secondTimestamp;
  }

  return normalizeId(firstRequest?.id) - normalizeId(secondRequest?.id);
};

export const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const vacancyStatusOptions = [
  { value: '', label: 'Todos os status da vaga' },
  { value: 'open', label: vacancyStatusLabels.open },
  { value: 'booked', label: vacancyStatusLabels.booked },
  { value: 'expired', label: vacancyStatusLabels.expired },
  { value: 'cancelled', label: vacancyStatusLabels.cancelled },
  { value: 'no_show', label: vacancyStatusLabels.no_show },
];

export const createLookupById = (items = []) => {
  const entries = items
    .filter((item) => item?.id !== undefined && item?.id !== null)
    .map((item) => [normalizeId(item.id), item]);

  return new Map(entries);
};

export const formatVacancyDate = (value) => {
  const parsedDate = toValidDate(value);

  if (!parsedDate) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate);
};

export const formatVacancyTime = (value) => {
  const parsedDate = toValidDate(value);

  if (!parsedDate) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsedDate);
};

export const formatVacancyDateTime = (value) => {
  const formattedDate = formatVacancyDate(value);
  const formattedTime = formatVacancyTime(value);

  if (formattedDate === '-' && formattedTime === '-') {
    return '-';
  }

  return `${formattedDate} às ${formattedTime}`;
};

export const getVacancyStatusLabel = (status) => {
  return vacancyStatusLabels[status] ?? String(status ?? 'Status indisponível');
};

export const getVacancyStatusDescription = (status) => {
  return vacancyStatusDescriptions[status] ?? 'Status indisponível no momento.';
};

export const getVacancyQueueRequests = (appointment, requests = []) => {
  if (!appointment) {
    return [];
  }

  return requests
    .filter((request) => {
      const requestDoctorId =
        request?.doctorId === undefined || request?.doctorId === null
          ? null
          : normalizeId(request.doctorId);

      return (
        request?.status === 'waiting'
        && normalizeId(request?.specialityId) === normalizeId(appointment.specialityId)
        && (
          requestDoctorId === null
          || requestDoctorId === normalizeId(appointment.doctorId)
        )
      );
    })
    .sort(sortRequestsByDate);
};

export const buildVacancyFromAppointment = (
  appointment,
  {
    professionalsById = new Map(),
    specialtiesById = new Map(),
    requests = [],
  } = {},
) => {
  const doctorId = normalizeId(appointment?.doctorId);
  const specialityId = normalizeId(appointment?.specialityId);
  const professional = professionalsById.get(doctorId);
  const speciality = specialtiesById.get(specialityId);
  const queueRequests = getVacancyQueueRequests(appointment, requests);

  return {
    id: normalizeId(appointment?.id),
    doctorId,
    specialityId,
    createdBy: normalizeId(appointment?.createdBy),
    createdByLabel: appointment?.createdBy
      ? `Usuário #${appointment.createdBy}`
      : 'Usuário não informado',
    rawDate: appointment?.date ?? '',
    dateKey: formatLocalDateKey(appointment?.date),
    date: formatVacancyDate(appointment?.date),
    time: formatVacancyTime(appointment?.date),
    dateTime: formatVacancyDateTime(appointment?.date),
    specialty: speciality?.name ?? `Especialidade #${specialityId}`,
    professional: professional?.name ?? `Profissional #${doctorId}`,
    queuePatients: queueRequests.length,
    vacancyStatus: appointment?.status ?? 'open',
    vacancyStatusText: getVacancyStatusLabel(appointment?.status),
    statusDescription: getVacancyStatusDescription(appointment?.status),
  };
};

export const buildVacancyList = (appointments = [], relationships = {}) => {
  return appointments
    .map((appointment) => buildVacancyFromAppointment(appointment, relationships))
    .sort((firstVacancy, secondVacancy) => {
      const now = Date.now();
      const firstTimestamp = toValidDate(firstVacancy.rawDate)?.getTime() ?? 0;
      const secondTimestamp = toValidDate(secondVacancy.rawDate)?.getTime() ?? 0;
      const firstIsPast = firstTimestamp < now;
      const secondIsPast = secondTimestamp < now;

      if (firstIsPast !== secondIsPast) {
        return firstIsPast ? 1 : -1;
      }

      if (firstTimestamp !== secondTimestamp) {
        return firstTimestamp - secondTimestamp;
      }

      return firstVacancy.id - secondVacancy.id;
    });
};

export const buildVacancyQueueItems = (
  appointment,
  requests = [],
  patientsById = new Map(),
) => {
  return getVacancyQueueRequests(appointment, requests).map((request) => {
    const patient = patientsById.get(normalizeId(request.patientId));

    return {
      id: normalizeId(request.id),
      patientId: normalizeId(request.patientId),
      patientName: patient?.name ?? `Paciente #${request.patientId}`,
      requestedDateTime: formatVacancyDateTime(request.date),
      attempts: Number(request.attempts) || 0,
      doctorScopeLabel: request.doctorId
        ? 'Preferência por este profissional'
        : 'Atendimento com qualquer profissional da especialidade',
      cooldownLabel: request.cooldownUntil
        ? `Novo contato liberado após ${formatVacancyDateTime(request.cooldownUntil)}`
        : 'Contato disponível no momento',
    };
  });
};

export const canDeleteVacancy = (vacancy) => {
  return vacancy?.vacancyStatus !== 'booked' && vacancy?.vacancyStatus !== 'no_show';
};

export const vacancyEditUnavailableMessage =
  'A edição desta vaga ainda não está disponível.';

export const canEditVacancy = () => false;
