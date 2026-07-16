import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from './api';

const removeUndefinedFields = (payload = {}) => (
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  )
);

const normalizeRequiredNumberField = (value, fieldLabel) => {
  const normalizedValue = Number(value);

  if (Number.isNaN(normalizedValue)) {
    throw new Error(`${fieldLabel} inválido.`);
  }

  return normalizedValue;
};

const normalizeOptionalNumberField = (value, fieldLabel) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return normalizeRequiredNumberField(value, fieldLabel);
};

const normalizeStatus = (value) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue || undefined;
};

const normalizeDateField = (value) => {
  if (!value) {
    return undefined;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Data da solicitação inválida.');
  }

  return parsedDate.toISOString();
};

const normalizeAppointmentRequestPayload = (
  requestData = {},
  { allowPartial = false } = {},
) => {
  const payload = removeUndefinedFields({
    patientId:
      requestData.patientId === undefined && allowPartial
        ? undefined
        : normalizeRequiredNumberField(requestData.patientId, 'Paciente'),
    specialityId:
      requestData.specialityId === undefined && allowPartial
        ? undefined
        : normalizeRequiredNumberField(requestData.specialityId, 'Especialidade'),
    doctorId:
      requestData.doctorId === undefined && allowPartial
        ? undefined
        : normalizeOptionalNumberField(requestData.doctorId, 'Profissional'),
    status:
      requestData.status === undefined && allowPartial
        ? undefined
        : normalizeStatus(requestData.status),
    date:
      requestData.date === undefined && allowPartial
        ? undefined
        : normalizeDateField(requestData.date),
  });

  if (allowPartial) {
    return payload;
  }

  if (!payload.status) {
    throw new Error('Status da solicitação é obrigatório.');
  }

  if (!payload.date) {
    throw new Error('Data da solicitação é obrigatória.');
  }

  return payload;
};

const normalizeAppointmentRequestEntity = (request = {}) => ({
  ...request,
  specialityId: request?.specialityId ?? request?.specialtyId ?? null,
  doctorId: request?.doctorId ?? null,
});

const buildAppointmentRequestsQueryString = (filters = {}) => {
  const searchParams = new URLSearchParams();

  if (filters.patientId !== undefined && filters.patientId !== null && filters.patientId !== '') {
    searchParams.set('patientId', String(filters.patientId));
  }

  if (
    filters.specialityId !== undefined
    && filters.specialityId !== null
    && filters.specialityId !== ''
  ) {
    searchParams.set('specialityId', String(filters.specialityId));
  }

  if (filters.doctorId !== undefined && filters.doctorId !== null && filters.doctorId !== '') {
    searchParams.set('doctorId', String(filters.doctorId));
  }

  if (filters.status) {
    searchParams.set('status', String(filters.status));
  }

  if (filters.page !== undefined && filters.page !== null && filters.page !== '') {
    searchParams.set('page', String(filters.page));
  }

  if (filters.size !== undefined && filters.size !== null && filters.size !== '') {
    searchParams.set('size', String(filters.size));
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
};

export const getAllAppointmentRequests = async (filters = {}) => {
  const data = await getRequest(
    `/appointment-request${buildAppointmentRequestsQueryString(filters)}`,
  );
  const appointmentRequests = Array.isArray(data)
    ? data
    : data?.appointmentRequests ?? data?.requests ?? data?.data ?? [];

  return appointmentRequests.map(normalizeAppointmentRequestEntity);
};

export const getAppointmentRequestById = async (requestId) => {
  const data = await getRequest(`/appointment-request/${requestId}`);

  return normalizeAppointmentRequestEntity(
    data?.appointmentRequest ?? data?.request ?? data,
  );
};

export const createAppointmentRequest = async (requestData) => {
  const data = await postRequest(
    '/appointment-request',
    normalizeAppointmentRequestPayload(requestData),
  );

  return normalizeAppointmentRequestEntity(
    data?.appointmentRequest ?? data?.request ?? data,
  );
};

export const updateAppointmentRequest = async (requestId, requestData) => {
  const data = await putRequest(
    `/appointment-request/${requestId}`,
    normalizeAppointmentRequestPayload(requestData, { allowPartial: true }),
  );

  return normalizeAppointmentRequestEntity(
    data?.appointmentRequest ?? data?.request ?? data,
  );
};

export const deleteAppointmentRequest = async (requestId) => {
  return deleteRequest(`/appointment-request/${requestId}`);
};
