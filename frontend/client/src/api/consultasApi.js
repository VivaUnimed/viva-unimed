import { getRequest } from './api';

/*
 * Evita buscar várias vezes o mesmo médico e a mesma especialidade.
 *
 * No seu exemplo, as três vagas utilizam:
 * doctorId = 8
 * specialityId = 1
 *
 * Então cada informação será consultada apenas uma vez.
 */
const doctorsCache = new Map();
const specialitiesCache = new Map();

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const getStatusLabel = (status) => {
  const labels = {
    open: 'Disponível',
    booked: 'Agendada',
    cancelled: 'Cancelada',
    no_show: 'Não compareceu',
    expired: 'Expirada',
  };

  return labels[status] ?? status ?? '';
};

const getStatusVariant = (status) => {
  if (status === 'open' || status === 'booked') {
    return 'green';
  }

  return 'gray';
};

/**
 * Busca o médico pelo doctorId.
 */
const getDoctorById = async (doctorId) => {
  if (!doctorId) {
    return null;
  }

  if (doctorsCache.has(doctorId)) {
    return doctorsCache.get(doctorId);
  }

  try {
    const doctor = await getRequest(
      `/api/doctor/${doctorId}`,
    );

    doctorsCache.set(doctorId, doctor);

    return doctor;
  } catch (error) {
    console.warn(
      `Não foi possível buscar o médico ${doctorId}:`,
      error.message,
    );

    doctorsCache.set(doctorId, null);

    return null;
  }
};

/**
 * Busca a especialidade pelo specialityId.
 */
const getSpecialityById = async (specialityId) => {
  if (!specialityId) {
    return null;
  }

  if (specialitiesCache.has(specialityId)) {
    return specialitiesCache.get(specialityId);
  }

  try {
    const speciality = await getRequest(
      `/api/speciality/${specialityId}`,
    );

    specialitiesCache.set(
      specialityId,
      speciality,
    );

    return speciality;
  } catch (error) {
    console.warn(
      `Não foi possível buscar a especialidade ${specialityId}:`,
      error.message,
    );

    specialitiesCache.set(specialityId, null);

    return null;
  }
};

const getDoctorName = (doctor, doctorId) => {
  return (
    doctor?.user?.name ??
    doctor?.name ??
    doctor?.userName ??
    doctor?.nome ??
    `Profissional #${doctorId}`
  );
};

const getSpecialityName = (
  speciality,
  specialityId,
) => {
  return (
    speciality?.name ??
    speciality?.description ??
    speciality?.nome ??
    `Especialidade #${specialityId}`
  );
};

const normalizeConsulta = ({
  appointment,
  doctor,
  speciality,
}) => ({
  id: appointment.id ?? '',

  especialidade: getSpecialityName(
    speciality,
    appointment.specialityId,
  ),

  status: getStatusLabel(
    appointment.status,
  ),

  statusVariant: getStatusVariant(
    appointment.status,
  ),

  medico: getDoctorName(
    doctor,
    appointment.doctorId,
  ),

  dataResumo: formatDate(
    appointment.date,
  ),

  /*
   * O contrato atual de Appointment não possui
   * campo de local.
   */
  local: 'Local não informado',

  original: appointment,
});

export const getMinhasConsultas = async () => {
  try {
    const response = await getRequest(
      '/api/appointment',
    );

    const appointments = Array.isArray(response)
      ? response
      : response?.appointments ??
        response?.data ??
        [];

    if (!Array.isArray(appointments)) {
      return [];
    }

    const consultas = await Promise.all(
      appointments.map(async (appointment) => {
        const [doctor, speciality] =
          await Promise.all([
            getDoctorById(
              appointment.doctorId,
            ),
            getSpecialityById(
              appointment.specialityId,
            ),
          ]);

        return normalizeConsulta({
          appointment,
          doctor,
          speciality,
        });
      }),
    );

    return consultas;
  } catch (error) {
    console.error(
      'Erro ao carregar os agendamentos:',
      error,
    );

    throw new Error(
      error?.message ||
        'Não foi possível carregar os agendamentos.',
    );
  }
};