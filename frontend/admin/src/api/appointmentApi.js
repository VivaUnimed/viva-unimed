import {
  deleteRequest,
  getRequest,
  postRequest,
} from './api';

const normalizeNumberField = (value) => {
  const normalizedValue = Number(value);

  if (Number.isNaN(normalizedValue)) {
    throw new Error('Os identificadores da vaga devem ser numéricos.');
  }

  return normalizedValue;
};

const buildAppointmentDateTime = (date, time) => {
  if (!date || !time) {
    throw new Error('Data e horário da vaga são obrigatórios.');
  }

  const parsedDate = new Date(`${date}T${time}`);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Data ou horário da vaga inválidos.');
  }

  return parsedDate.toISOString();
};

const normalizeAppointmentPayload = (appointmentData = {}) => ({
  doctorId: normalizeNumberField(appointmentData.doctorId),
  specialityId: normalizeNumberField(appointmentData.specialityId),
  date: buildAppointmentDateTime(appointmentData.date, appointmentData.time),
});

export const getAllAppointments = async () => {
  const data = await getRequest('/appointment');

  return Array.isArray(data)
    ? data
    : data?.appointments ?? data?.data ?? [];
};

export const getAppointmentById = async (appointmentId) => {
  const data = await getRequest(`/appointment/${appointmentId}`);

  return data?.appointment ?? data;
};

export const createAppointment = async (appointmentData) => {
  const data = await postRequest(
    '/appointment',
    normalizeAppointmentPayload(appointmentData),
  );

  return data?.appointment ?? data;
};

export const deleteAppointment = async (appointmentId) => {
  return deleteRequest(`/appointment/${appointmentId}`);
};
