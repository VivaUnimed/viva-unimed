import { getRequest, postRequest } from './api';

const normalizePhone = (phone) => {
  if (!phone) {
    return undefined;
  }

  const onlyNumbers = String(phone).replace(/\D/g, '');

  return onlyNumbers ? Number(onlyNumbers) : undefined;
};

const normalizeUserPayload = (userData = {}) => ({
  name: userData.name?.trim() ?? '',
  email: userData.email?.trim() ?? '',
  phone: normalizePhone(userData.phone),
  cpf: userData.cpf?.trim() || undefined,
  password: userData.password,
  roles: userData.roles ?? ['Paciente'],
});

const removeUndefinedFields = (payload = {}) => {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
};

const buildUsersQueryString = (filters = {}) => {
  const searchParams = new URLSearchParams();
  const nameLike = filters.nameLike?.trim();
  const emailLike = filters.emailLike?.trim();

  if (nameLike) {
    searchParams.set('nameLike', nameLike);
  }

  if (emailLike) {
    searchParams.set('emailLike', emailLike);
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
};

export const getAllUsers = async (filters = {}) => {
  const queryString = buildUsersQueryString(filters);
  const data = await getRequest(`/user${queryString}`);

  return Array.isArray(data) ? data : data?.users ?? data?.data ?? [];
};

export const getUserById = async (userId) => {
  return getRequest(`/user/${userId}`);
};

export const createUser = async (userData) => {
  const normalizedPayload = removeUndefinedFields(
    normalizeUserPayload(userData),
  );
  const data = await postRequest('/user', normalizedPayload);

  return data?.user ?? data;
};

// TODO: implementar atualização de dados básicos do usuário quando o endpoint for confirmado.
