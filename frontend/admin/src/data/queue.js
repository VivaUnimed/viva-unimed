import { formatCpf, formatPhone } from '../utils/patients/patientFormatters';

const queueStatusLabels = {
  waiting: 'Aguardando',
  approved: 'Aprovado',
  cancelled: 'Cancelado',
  expired: 'Expirado',
  rejected: 'Recusado',
};

const vacancyStatusLabels = {
  open: 'Aberta',
  booked: 'Reservada',
  expired: 'Expirada',
  cancelled: 'Cancelada',
  no_show: 'No-show',
};

const queueStatusOrder = {
  waiting: 0,
  approved: 1,
  rejected: 2,
  expired: 3,
  cancelled: 4,
};

const normalizeId = (value) => Number(value);

const toValidDate = (value) => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

export const normalizeText = (value = '') => (
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
);

export const createLookupById = (items = []) => {
  const entries = items
    .filter((item) => item?.id !== undefined && item?.id !== null)
    .map((item) => [normalizeId(item.id), item]);

  return new Map(entries);
};

export const formatQueueDate = (value) => {
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

export const formatQueueTime = (value) => {
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

export const formatQueueDateTime = (value) => {
  const formattedDate = formatQueueDate(value);
  const formattedTime = formatQueueTime(value);

  if (formattedDate === '-' && formattedTime === '-') {
    return '-';
  }

  return `${formattedDate} às ${formattedTime}`;
};

export const getQueueStatusLabel = (status) => (
  queueStatusLabels[status] ?? String(status ?? 'Status indisponível')
);

export const getVacancyStatusLabel = (status) => (
  vacancyStatusLabels[status] ?? String(status ?? 'Status indisponível')
);

export const queueStatusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'waiting', label: queueStatusLabels.waiting },
  { value: 'approved', label: queueStatusLabels.approved },
  { value: 'cancelled', label: queueStatusLabels.cancelled },
];

export const queueEditableStatusOptions = [
  { value: 'waiting', label: queueStatusLabels.waiting },
  { value: 'approved', label: queueStatusLabels.approved },
  { value: 'cancelled', label: queueStatusLabels.cancelled },
];

export const getEligibleProfessionalsForSpecialty = (
  specialityId,
  professionals = [],
) => {
  const normalizedSpecialityId = normalizeId(specialityId);

  if (!normalizedSpecialityId) {
    return professionals;
  }

  return professionals.filter((professional) => (
    Array.isArray(professional.specialityIds)
    && professional.specialityIds.includes(normalizedSpecialityId)
  ));
};

export const getCompatibleVacancies = (request, vacancies = []) => {
  if (!request) {
    return [];
  }

  const requestSpecialityId = normalizeId(request.specialityId);
  const requestDoctorId = request.doctorId ? normalizeId(request.doctorId) : null;

  return vacancies.filter((vacancy) => {
    if (vacancy.status !== 'open') {
      return false;
    }

    if (normalizeId(vacancy.specialityId) !== requestSpecialityId) {
      return false;
    }

    if (!requestDoctorId) {
      return true;
    }

    return normalizeId(vacancy.doctorId) === requestDoctorId;
  });
};

export const buildCompatibleAppointmentList = (
  request,
  {
    vacancies = [],
    professionalsById = new Map(),
    specialtiesById = new Map(),
  } = {},
) => {
  return getCompatibleVacancies(request, vacancies).map((vacancy) => ({
    id: normalizeId(vacancy.id),
    specialty:
      specialtiesById.get(normalizeId(vacancy.specialityId))?.name
      ?? 'Especialidade não encontrada',
    professional:
      professionalsById.get(normalizeId(vacancy.doctorId))?.name
      ?? 'Profissional não encontrado',
    date: formatQueueDate(vacancy.date),
    time: formatQueueTime(vacancy.date),
    dateTime: formatQueueDateTime(vacancy.date),
    status: vacancy.status ?? 'open',
    statusLabel: getVacancyStatusLabel(vacancy.status),
  }));
};

export const buildCompatibleVacancyList = buildCompatibleAppointmentList;

export const buildQueueRequestItem = (
  request,
  {
    patientsById = new Map(),
    professionalsById = new Map(),
    specialtiesById = new Map(),
    vacancies = [],
  } = {},
) => {
  const requestPatientId = normalizeId(request.patientId);
  const requestSpecialityId = normalizeId(
    request.specialityId ?? request.specialtyId,
  );
  const requestDoctorId = request.doctorId ? normalizeId(request.doctorId) : null;
  const patient = request.patient ?? patientsById.get(requestPatientId);
  const specialty =
    request.speciality
    ?? request.specialitie
    ?? request.specialty
    ?? specialtiesById.get(requestSpecialityId);
  const preferredProfessional = request.doctorId
    ? request.doctor ?? professionalsById.get(requestDoctorId)
    : null;
  const compatibleAppointments = buildCompatibleAppointmentList(request, {
    vacancies,
    professionalsById,
    specialtiesById,
  });
  const compatibleAppointmentsCount = compatibleAppointments.length;
  const queueEntryValue = request.date ?? request.createdAt;

  return {
    ...request,
    requestId: normalizeId(request.id),
    patientId: requestPatientId,
    specialityId: requestSpecialityId,
    doctorId: requestDoctorId,
    patientName: patient?.name ?? 'Paciente não encontrado',
    patientCpf: patient?.cpf ?? '',
    patientCpfFormatted: formatCpf(patient?.cpf ?? ''),
    patientPhone: patient?.phone ?? '',
    patientPhoneFormatted: formatPhone(patient?.phone ?? ''),
    patientEmail: patient?.email ?? 'Não informado',
    specialityName: specialty?.name ?? 'Especialidade não encontrada',
    specialtyName: specialty?.name ?? 'Especialidade não encontrada',
    doctorName: preferredProfessional?.name ?? 'Qualquer profissional',
    professionalName: preferredProfessional?.name ?? 'Qualquer profissional',
    statusLabel: getQueueStatusLabel(request.status),
    queueEntryDate: formatQueueDate(queueEntryValue),
    queueEntryTime: formatQueueTime(queueEntryValue),
    queueEntryDateTime: formatQueueDateTime(queueEntryValue),
    createdAtDate: formatQueueDate(request.createdAt),
    createdAtTime: formatQueueTime(request.createdAt),
    createdAtDateTime: formatQueueDateTime(request.createdAt),
    updatedAtDateTime: formatQueueDateTime(request.updatedAt),
    compatibleAppointments,
    compatibleAppointmentsCount,
    compatibleAppointmentsText:
      compatibleAppointmentsCount === 1
        ? 'vaga compatível'
        : 'vagas compatíveis',
    compatibleVacancies: compatibleAppointments,
    compatibleVacanciesCount: compatibleAppointmentsCount,
    compatibleVacanciesText:
      compatibleAppointmentsCount === 1
        ? 'vaga compatível'
        : 'vagas compatíveis',
  };
};

export const buildQueueRequestList = (requests = [], relationships = {}) => {
  return requests
    .map((request) => buildQueueRequestItem(request, relationships))
    .sort((firstRequest, secondRequest) => {
      const firstOrder = queueStatusOrder[firstRequest.status] ?? 99;
      const secondOrder = queueStatusOrder[secondRequest.status] ?? 99;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      const firstTimestamp = toValidDate(firstRequest.createdAt)?.getTime() ?? 0;
      const secondTimestamp = toValidDate(secondRequest.createdAt)?.getTime() ?? 0;

      if (firstTimestamp !== secondTimestamp) {
        return secondTimestamp - firstTimestamp;
      }

      return normalizeId(secondRequest.id) - normalizeId(firstRequest.id);
    });
};

export const buildAdminAppointmentRequest = buildQueueRequestItem;

export const buildAdminAppointmentRequests = buildQueueRequestList;

export const buildQueueSummary = (queueRequests = []) => ({
  total: queueRequests.length,
  waiting: queueRequests.filter((request) => request.status === 'waiting').length,
  withCompatibleVacancy: queueRequests.filter(
    (request) => request.status === 'waiting' && request.compatibleVacanciesCount > 0,
  ).length,
  withoutCompatibleVacancy: queueRequests.filter(
    (request) => request.status === 'waiting' && request.compatibleVacanciesCount === 0,
  ).length,
  cancelled: queueRequests.filter((request) => request.status === 'cancelled').length,
});
