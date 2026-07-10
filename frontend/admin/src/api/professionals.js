import { toast } from 'react-toastify';
import { professionalTypes } from '../context/professionalContext/professionalTypes';

import { getRequest, postRequest, putRequest, deleteRequest } from './api';

export const getAllProfessionals = async (dispatch) => {
  dispatch({ type: professionalTypes.GET_ALL_PROFESSIONALS_REQUEST });

  try {
    const data = await getRequest('/professionals/');
    const professionals = data?.professionals ?? [];

    dispatch({
      type: professionalTypes.GET_ALL_PROFESSIONALS_SUCCESS,
      payload: { professionals },
    });

    return professionals;
  } catch (error) {
    dispatch({
      type: professionalTypes.GET_ALL_PROFESSIONALS_FAILURE,
      payload: { error: error.message },
    });

    toast.error('Erro ao carregar profissionais!');
    throw error;
  }
};

export const createProfessional = async (newProfessional, dispatch) => {
  dispatch({ type: professionalTypes.CREATE_PROFESSIONAL_REQUEST });

  try {
    const data = await toast.promise(postRequest('/professionals/', newProfessional), {
      pending: 'Criando Profissional...',
      success: 'Profissional criado com sucesso!',
      error: {
        render({ data }) {
          return (
            data?.response?.data?.message ||
            data?.message ||
            'Erro ao criar o profissional'
          );
        },
      },
    });
    const professional = data?.professional ?? data;

    dispatch({
      type: professionalTypes.CREATE_PROFESSIONAL_SUCCESS,
      payload: { professional },
    });

    return professional;
  } catch (error) {
    dispatch({
      type: professionalTypes.CREATE_PROFESSIONAL_FAILURE,
      payload: { error: error.message },
    });

    throw error;
  }
};

export const updateProfessional = async (updatedProfessional, id, dispatch) => {
  dispatch({ type: professionalTypes.UPDATE_PROFESSIONAL_REQUEST });

  try {
    const data = await toast.promise(putRequest(`/professionals/${id}`, updatedProfessional), {
      pending: 'Editando Profissional...',
      success: 'Profissional editado com sucesso!',
      error: {
        render({ data }) {
          return (
            data?.response?.data?.message ||
            data?.message ||
            'Erro ao editar o profissional'
          );
        },
      },
    });
    const professional = data?.professional ?? data;

    dispatch({
      type: professionalTypes.UPDATE_PROFESSIONAL_SUCCESS,
      payload: { professional, id },
    });

    return professional;
  } catch (error) {
    dispatch({
      type: professionalTypes.UPDATE_PROFESSIONAL_FAILURE,
      payload: { error: error.message },
    });

    throw error;
  }
};

export const deleteProfessional = async (id, dispatch) => {
  dispatch({ type: professionalTypes.DELETE_PROFESSIONAL_REQUEST });

  try {
    await toast.promise(deleteRequest(`/professionals/${id}`), {
      pending: 'Excluindo Profissional...',
      success: 'Profissional excluído com sucesso!',
      error: {
        render({ data }) {
          return (
            data?.response?.data?.message ||
            data?.message ||
            'Erro ao excluir o profissional'
          );
        },
      },
    });

    dispatch({ type: professionalTypes.DELETE_PROFESSIONAL_SUCCESS, payload: { id } });

    return id;
  } catch (error) {
    dispatch({
      type: professionalTypes.DELETE_PROFESSIONAL_FAILURE,
      payload: { error: error.message },
    });

    throw error;
  }
};
