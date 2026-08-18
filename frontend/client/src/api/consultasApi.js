import {
  getRequest,
} from './api';

/**
 * Formata data + horário.
 *
 * Exemplo:
 * 17/08/2026, 18:15
 */
const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(date);
};

/**
 * Traduz o status do backend.
 */
const getStatusLabel = (
  status,
) => {
  const labels = {
    open:
      'Disponível',

    booked:
      'Agendada',

    cancelled:
      'Cancelada',

    no_show:
      'Não compareceu',

    expired:
      'Expirada',
  };

  return (
    labels[status] ??
    status ??
    ''
  );
};

/**
 * Define a classe utilizada
 * para mostrar o status.
 */
const getStatusVariant = (
  status,
) => {
  if (
    status === 'booked'
  ) {
    return 'green';
  }

  return 'gray';
};

/**
 * Converte o Appointment retornado
 * pelo backend para o formato usado
 * pela página Minhas Consultas.
 */
const normalizeConsulta = (
  appointment = {},
) => {

  const doctor =
    appointment.doctor ??
    {};

  const doctorUser =
    doctor.user ??
    {};

  const speciality =
    appointment.speciality ??
    {};

  return {
    id:
      appointment.id ??
      '',

    especialidade:
      speciality.name ??
      'Especialidade não informada',

    status:
      getStatusLabel(
        appointment.status,
      ),

    statusVariant:
      getStatusVariant(
        appointment.status,
      ),

    medico:
      doctorUser.name ??
      'Profissional',

    crm:
      doctor.crm ??
      '',

    dataResumo:
      formatDate(
        appointment.date,
      ),

    /**
     * Ainda não existe localização
     * no modelo Appointment.
     */
    local:
      'Local não informado',

    original:
      appointment,
  };
};

/**
 * Lista somente as consultas
 * do paciente autenticado.
 */
export const getMinhasConsultas =
  async () => {

    try {

      const response =
        await getRequest(
          '/api/appointment/me',
        );

      const appointments =
        Array.isArray(response)
          ? response
          : Array.isArray(
              response?.data,
            )
            ? response.data
            : [];

      return appointments.map(
        normalizeConsulta,
      );

    } catch (error) {

      console.error(
        'Erro ao carregar as consultas do paciente:',
        error,
      );

      throw new Error(
        error?.message ||
          'Não foi possível carregar suas consultas.',
      );
    }
  };