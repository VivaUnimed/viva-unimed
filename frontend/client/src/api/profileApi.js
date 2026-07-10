import { getRequest, putRequest } from './api';

const normalizeProfile = (data = {}) => ({
  id: data.id ?? data._id ?? null,
  name: data.name ?? data.nome ?? '',
  email: data.email ?? '',
  phone: data.phone ?? data.telefone ?? data.phone_number ?? '',
  cpf: data.cpf ?? '',
  birthDate: data.birthDate ?? data.birth_date ?? data.date_of_birth ?? '',
});


export const getProfile = async () => {
  try {
    const data = await getRequest('/usuarios/me');
    return normalizeProfile(data);
  } catch (error) {
    throw new Error(error.message);
  }
};


export const updateProfile = async (profileData) => {
  try {
    const payload = {
      name: profileData.name ?? '',
      email: profileData.email ?? '',
      phone: profileData.phone ?? '',
      cpf: profileData.cpf ?? '',
      birthDate: profileData.birthDate ?? '',
    };

    const data = await putRequest('/usuarios/me', payload);
    return normalizeProfile(data || payload);
  } catch (error) {
    throw new Error(error.message);
  }
};
