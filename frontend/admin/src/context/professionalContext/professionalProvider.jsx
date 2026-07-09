import { useReducer } from 'react';
import { professionalReducer } from './professionalReducer';
import { professionalInitialState } from './professionalInitialState';
import { professionalContext as ProfessionalContext } from './professionalContext.js';
import { professionalTypes } from './professionalTypes';
import * as doctorApi from '../../api/doctorApi';

export default function ProfessionalProvider({ children }) {
  const [professionalState, professionalDispatch] = useReducer(
    professionalReducer,
    professionalInitialState,
  );

  const getProfessionals = async (filters = {}) => {
    professionalDispatch({
      type: professionalTypes.GET_ALL_PROFESSIONALS_REQUEST,
    });

    try {
      const professionals = await doctorApi.getAllDoctors(filters);

      professionalDispatch({
        type: professionalTypes.GET_ALL_PROFESSIONALS_SUCCESS,
        payload: { professionals },
      });

      return professionals;
    } catch (error) {
      professionalDispatch({
        type: professionalTypes.GET_ALL_PROFESSIONALS_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const getProfessionalById = async (professionalId) => {
    return doctorApi.getDoctorById(professionalId);
  };

  const createProfessional = async (newProfessional) => {
    professionalDispatch({
      type: professionalTypes.CREATE_PROFESSIONAL_REQUEST,
    });

    try {
      const professional = await doctorApi.createProfessional(newProfessional);

      professionalDispatch({
        type: professionalTypes.CREATE_PROFESSIONAL_SUCCESS,
        payload: { professional },
      });

      return professional;
    } catch (error) {
      professionalDispatch({
        type: professionalTypes.CREATE_PROFESSIONAL_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const updateProfessional = async (updatedProfessional, currentProfessional) => {
    professionalDispatch({
      type: professionalTypes.UPDATE_PROFESSIONAL_REQUEST,
    });

    try {
      const professional = await doctorApi.updateProfessional(
        updatedProfessional,
        currentProfessional,
      );

      professionalDispatch({
        type: professionalTypes.UPDATE_PROFESSIONAL_SUCCESS,
        payload: { professional, id: currentProfessional.id },
      });

      return professional;
    } catch (error) {
      professionalDispatch({
        type: professionalTypes.UPDATE_PROFESSIONAL_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const deleteProfessional = async (id) => {
    professionalDispatch({
      type: professionalTypes.DELETE_PROFESSIONAL_REQUEST,
    });

    try {
      await doctorApi.deleteDoctor(id);

      professionalDispatch({
        type: professionalTypes.DELETE_PROFESSIONAL_SUCCESS,
        payload: { id },
      });

      return id;
    } catch (error) {
      professionalDispatch({
        type: professionalTypes.DELETE_PROFESSIONAL_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  return (
    <ProfessionalContext.Provider
      value={{
        professionalState,
        professionalDispatch,
        getProfessionals,
        getProfessionalById,
        createProfessional,
        updateProfessional,
        deleteProfessional,
      }}
    >
      {children}
    </ProfessionalContext.Provider>
  );
}
