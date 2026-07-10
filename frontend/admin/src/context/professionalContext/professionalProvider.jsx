import { useReducer } from 'react';
import { professionalReducer } from './professionalReducer';
import { professionalInitialState } from './professionalInitialState';
import { professionalContext as ProfessionalContext } from './professionalContext.js';
import { professionalTypes } from './professionalTypes';
import {
  buildProfessionalFromForm,
  buildUpdatedProfessionalFromForm,
} from '../../data/professionals';

export default function ProfessionalProvider({ children }) {
  const [professionalState, professionalDispatch] = useReducer(
    professionalReducer,
    professionalInitialState,
  );

  const getProfessionals = async () => {
    professionalDispatch({
      type: professionalTypes.GET_ALL_PROFESSIONALS_REQUEST,
    });

    try {
      const professionals = professionalState.professionals;

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

      return [];
    }
  };

  const createProfessional = async (newProfessional) => {
    professionalDispatch({
      type: professionalTypes.CREATE_PROFESSIONAL_REQUEST,
    });

    try {
      const professional = buildProfessionalFromForm(
        newProfessional,
        professionalState.professionals,
      );

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

      return null;
    }
  };

  const updateProfessional = async (updatedProfessional, id) => {
    professionalDispatch({
      type: professionalTypes.UPDATE_PROFESSIONAL_REQUEST,
    });

    try {
      const currentProfessional = professionalState.professionals.find(
        (professional) => String(professional.id) === String(id),
      );

      if (!currentProfessional) {
        throw new Error('Profissional nao encontrado.');
      }

      const professional = buildUpdatedProfessionalFromForm(
        updatedProfessional,
        currentProfessional,
      );

      professionalDispatch({
        type: professionalTypes.UPDATE_PROFESSIONAL_SUCCESS,
        payload: { professional, id },
      });

      return professional;
    } catch (error) {
      professionalDispatch({
        type: professionalTypes.UPDATE_PROFESSIONAL_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  const deleteProfessional = async (id) => {
    professionalDispatch({
      type: professionalTypes.DELETE_PROFESSIONAL_REQUEST,
    });

    try {
      const currentProfessional = professionalState.professionals.find(
        (professional) => String(professional.id) === String(id),
      );

      if (!currentProfessional) {
        throw new Error('Profissional nao encontrado.');
      }

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

      return null;
    }
  };

  return (
    <ProfessionalContext.Provider
      value={{
        professionalState,
        professionalDispatch,
        getProfessionals,
        createProfessional,
        updateProfessional,
        deleteProfessional,
      }}
    >
      {children}
    </ProfessionalContext.Provider>
  );
}
