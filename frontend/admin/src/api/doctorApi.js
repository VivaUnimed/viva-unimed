import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from './api';
import {
  mapDoctorToProfessional,
} from '../data/professionals';
import {
  createUser,
  updateUser,
} from './userApi';

const normalizeDoctorId = (doctorId) => Number(doctorId);
const normalizeSpecialityId = (specialityId) => Number(specialityId);

const normalizeDoctorPayload = (doctorData = {}) => ({
  userId: Number(doctorData.userId),
  crm: doctorData.crm?.trim() ?? '',
  enabled:
    typeof doctorData.enabled === 'boolean'
      ? doctorData.enabled
      : doctorData.status === 'Ativo',
});

const buildDoctorsQueryString = (filters = {}) => {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set('search', filters.search.trim());
  }

  if (filters.specialityId !== undefined && filters.specialityId !== null && filters.specialityId !== '') {
    searchParams.set('specialityId', String(filters.specialityId));
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

const buildPartialPersistenceError = (error, persistedSteps) => {
  const baseMessage =
    error?.message || 'Não foi possível concluir o fluxo administrativo do profissional.';

  if (!persistedSteps.length) {
    return error;
  }

  return new Error(
    `${baseMessage} Atenção: houve persistência parcial no backend atual (${persistedSteps.join(', ')}).`,
  );
};

export const getAllDoctors = async (filters = {}) => {
  const data = await getRequest(`/doctor${buildDoctorsQueryString(filters)}`);
  const doctors = Array.isArray(data)
    ? data
    : data?.doctors ?? data?.data ?? [];

  return doctors.map(mapDoctorToProfessional);
};

export const getDoctorById = async (doctorId) => {
  const data = await getRequest(`/doctor/${doctorId}`);

  return mapDoctorToProfessional(data?.doctor ?? data);
};

export const createDoctor = async (doctorData) => {
  const data = await postRequest('/doctor', normalizeDoctorPayload(doctorData));

  return mapDoctorToProfessional(data?.doctor ?? data);
};

export const updateDoctor = async (doctorId, doctorData) => {
  const data = await putRequest(
    `/doctor/${doctorId}`,
    normalizeDoctorPayload(doctorData),
  );

  return mapDoctorToProfessional(data?.doctor ?? data);
};

export const addDoctorSpeciality = async (doctorId, specialityId) => {
  return postRequest(`/doctor/${doctorId}/speciality`, {
    specialityId: normalizeSpecialityId(specialityId),
  });
};

export const removeDoctorSpeciality = async (doctorId, specialityId) => {
  return deleteRequest(`/doctor/${doctorId}/speciality`, {
    specialityId: normalizeSpecialityId(specialityId),
  });
};

export const deleteDoctor = async (doctorId) => {
  return deleteRequest(`/doctor/${doctorId}`);
};

export const createProfessional = async (professionalData) => {
  let createdUser = null;
  let createdDoctor = null;

  try {
    createdUser = await createUser({
      name: professionalData.name,
      email: professionalData.email,
      phone: professionalData.phone,
      cpf: professionalData.cpf,
    });

    createdDoctor = await createDoctor({
      userId: createdUser.id,
      crm: professionalData.crm,
      enabled: professionalData.status === 'Ativo',
    });

    // TODO: substituir este encadeamento quando o backend oferecer um endpoint transacional
    // para criação completa de profissionais (user + doctor + vínculos de especialidade).
    for (const specialityId of professionalData.specialityIds ?? []) {
      await addDoctorSpeciality(createdDoctor.id, specialityId);
    }

    return getDoctorById(createdDoctor.id);
  } catch (error) {
    const persistedSteps = [];

    if (createdUser) {
      persistedSteps.push(`usuário #${createdUser.id} criado`);
    }

    if (createdDoctor) {
      persistedSteps.push(`doctor #${createdDoctor.id} criado`);
    }

    throw buildPartialPersistenceError(error, persistedSteps);
  }
};

export const updateProfessional = async (professionalData, currentProfessional) => {
  const professionalId = normalizeDoctorId(currentProfessional?.id);
  const currentSpecialityIds = new Set(
    (currentProfessional?.specialityIds ?? []).map((specialityId) =>
      normalizeSpecialityId(specialityId),
    ),
  );
  const nextSpecialityIds = new Set(
    (professionalData.specialityIds ?? []).map((specialityId) =>
      normalizeSpecialityId(specialityId),
    ),
  );
  const specialityIdsToAdd = [...nextSpecialityIds].filter(
    (specialityId) => !currentSpecialityIds.has(specialityId),
  );
  const specialityIdsToRemove = [...currentSpecialityIds].filter(
    (specialityId) => !nextSpecialityIds.has(specialityId),
  );
  let userUpdated = false;
  let doctorUpdated = false;

  try {
    await updateUser(professionalId, {
      name: professionalData.name,
      email: professionalData.email,
      phone: professionalData.phone,
      cpf: professionalData.cpf,
    });
    userUpdated = true;

    await updateDoctor(professionalId, {
      userId: professionalId,
      crm: professionalData.crm,
      enabled: professionalData.status === 'Ativo',
    });
    doctorUpdated = true;

    // TODO: o backend atual não oferece sincronização transacional das especialidades
    // durante a edição. O frontend precisa manter este diff explícito por enquanto.
    for (const specialityId of specialityIdsToRemove) {
      await removeDoctorSpeciality(professionalId, specialityId);
    }

    for (const specialityId of specialityIdsToAdd) {
      await addDoctorSpeciality(professionalId, specialityId);
    }

    return getDoctorById(professionalId);
  } catch (error) {
    const persistedSteps = [];

    if (userUpdated) {
      persistedSteps.push(`usuário #${professionalId} atualizado`);
    }

    if (doctorUpdated) {
      persistedSteps.push(`doctor #${professionalId} atualizado`);
    }

    throw buildPartialPersistenceError(error, persistedSteps);
  }
};
