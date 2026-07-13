import { getRequest } from './api';

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

  return Array.isArray(data)
    ? data
    : data?.appointmentRequests ?? data?.requests ?? data?.data ?? [];
};
