import { toast } from 'react-toastify';
import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from './api';

const removeUndefinedFields = (payload = {}) => {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
};

const normalizeUserId = (userId) => {
  if (userId === undefined || userId === null || userId === '') {
    return undefined;
  }

  const normalizedUserId = Number(userId);

  return Number.isNaN(normalizedUserId) ? undefined : normalizedUserId;
};

const normalizePatientPayload = (patientData = {}) => ({
  userId: normalizeUserId(patientData.userId),
  birth: patientData.birth,
});

const normalizePatientUpdatePayload = (patientData = {}) => ({
  birth: patientData.birth,
});

export const getAllPatients = async () => {
  try {
    const data = await getRequest('/patient');
    const patients = Array.isArray(data)
      ? data
      : data?.patients ?? data?.data ?? [];

    return patients;
  } catch (error) {
    toast.error('Erro ao carregar pacientes!');
    throw error;
  }
};

export const getPatientById = async (id) => {
  return getRequest(`/patient/${id}`);
};

export const createPatient = async (patientData) => {
  try {
    const normalizedPayload = removeUndefinedFields(
      normalizePatientPayload(patientData),
    );
    const data = await toast.promise(
      postRequest('/patient', normalizedPayload),
      {
        pending: 'Criando paciente...',
        success: 'Paciente criado com sucesso!',
        error: {
          render({ data: toastError }) {
            return (
              toastError?.response?.data?.message ||
              toastError?.message ||
              'Erro ao criar paciente'
            );
          },
        },
      },
    );

    const patient = data?.patient ?? data;

    return patient;
  } catch (error) {
    throw error;
  }
};

export const updatePatient = async (patientData, id) => {
  try {
    const normalizedPayload = removeUndefinedFields(
      normalizePatientUpdatePayload(patientData),
    );
    const data = await toast.promise(
      putRequest(`/patient/${id}`, normalizedPayload),
      {
        pending: 'Atualizando paciente...',
        success: 'Paciente atualizado com sucesso!',
        error: {
          render({ data: toastError }) {
            return (
              toastError?.response?.data?.message ||
              toastError?.message ||
              'Erro ao atualizar paciente'
            );
          },
        },
      },
    );

    const patient = data?.patient ?? data;

    return patient;
  } catch (error) {
    throw error;
  }
};

export const deletePatient = async (id) => {
  try {
    await toast.promise(deleteRequest(`/patient/${id}`), {
      pending: 'Excluindo paciente...',
      success: 'Paciente excluído com sucesso!',
      error: {
        render({ data: toastError }) {
          return (
            toastError?.response?.data?.message ||
            toastError?.message ||
            'Erro ao excluir paciente'
          );
        },
      },
    });

    return id;
  } catch (error) {
    throw error;
  }
};
