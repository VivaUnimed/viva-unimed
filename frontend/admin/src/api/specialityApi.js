import { toast } from 'react-toastify';
import { specialtyTypes } from '../context/specialtyContext/specialtyTypes';
import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from './api';

const normalizeSpecialityPayload = (specialityData = {}) => ({
  name: specialityData.name?.trim() ?? '',
});

export const getAllSpecialties = async (dispatch) => {
  dispatch?.({ type: specialtyTypes.GET_ALL_SPECIALTIES_REQUEST });

  try {
    const data = await getRequest('/speciality');
    const specialties = Array.isArray(data)
      ? data
      : data?.specialties ?? data?.data ?? [];

    dispatch?.({
      type: specialtyTypes.GET_ALL_SPECIALTIES_SUCCESS,
      payload: { specialties },
    });

    return specialties;
  } catch (error) {
    dispatch?.({
      type: specialtyTypes.GET_ALL_SPECIALTIES_FAILURE,
      payload: { error: error.message },
    });

    toast.error('Erro ao carregar especialidades!');
    throw error;
  }
};

export const getSpecialtyById = async (id) => {
  return getRequest(`/speciality/${id}`);
};

export const createSpecialty = async (specialityData, dispatch) => {
  dispatch?.({ type: specialtyTypes.CREATE_SPECIALTY_REQUEST });

  try {
    const data = await toast.promise(
      postRequest('/speciality', normalizeSpecialityPayload(specialityData)),
      {
        pending: 'Criando especialidade...',
        success: 'Especialidade criada com sucesso!',
        error: {
          render({ data: toastError }) {
            return (
              toastError?.response?.data?.message ||
              toastError?.message ||
              'Erro ao criar especialidade'
            );
          },
        },
      },
    );

    const specialty = data?.specialty ?? data;

    dispatch?.({
      type: specialtyTypes.CREATE_SPECIALTY_SUCCESS,
      payload: { specialty },
    });

    return specialty;
  } catch (error) {
    dispatch?.({
      type: specialtyTypes.CREATE_SPECIALTY_FAILURE,
      payload: { error: error.message },
    });

    throw error;
  }
};

export const updateSpecialty = async (specialityData, id, dispatch) => {
  dispatch?.({ type: specialtyTypes.UPDATE_SPECIALTY_REQUEST });

  try {
    const data = await toast.promise(
      putRequest(`/speciality/${id}`, normalizeSpecialityPayload(specialityData)),
      {
        pending: 'Atualizando especialidade...',
        success: 'Especialidade atualizada com sucesso!',
        error: {
          render({ data: toastError }) {
            return (
              toastError?.response?.data?.message ||
              toastError?.message ||
              'Erro ao atualizar especialidade'
            );
          },
        },
      },
    );

    const specialty = data?.specialty ?? data;

    dispatch?.({
      type: specialtyTypes.UPDATE_SPECIALTY_SUCCESS,
      payload: { specialty, id },
    });

    return specialty;
  } catch (error) {
    dispatch?.({
      type: specialtyTypes.UPDATE_SPECIALTY_FAILURE,
      payload: { error: error.message },
    });

    throw error;
  }
};

export const deleteSpecialty = async (id, dispatch) => {
  dispatch?.({ type: specialtyTypes.DELETE_SPECIALTY_REQUEST });

  try {
    await toast.promise(deleteRequest(`/speciality/${id}`), {
      pending: 'Excluindo especialidade...',
      success: 'Especialidade excluída com sucesso!',
      error: {
        render({ data: toastError }) {
          return (
            toastError?.response?.data?.message ||
            toastError?.message ||
            'Erro ao excluir especialidade'
          );
        },
      },
    });

    dispatch?.({
      type: specialtyTypes.DELETE_SPECIALTY_SUCCESS,
      payload: { id },
    });

    return id;
  } catch (error) {
    dispatch?.({
      type: specialtyTypes.DELETE_SPECIALTY_FAILURE,
      payload: { error: error.message },
    });

    throw error;
  }
};
