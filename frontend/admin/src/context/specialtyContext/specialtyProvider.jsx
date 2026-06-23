import { useReducer } from 'react';
import { specialtyContext as SpecialtyContext } from './specialtyContext';
import { specialtyInitialState } from './specialtyInitialState';
import { specialtyReducer } from './specialtyReducer';
import { specialtyTypes } from './specialtyTypes';

const buildSpecialtyFromData = (specialtyData, existingSpecialties = []) => {
  const nextId =
    existingSpecialties.reduce(
      (highestId, specialty) => Math.max(highestId, Number(specialty.id) || 0),
      0,
    ) + 1;

  return {
    id: nextId,
    name: specialtyData.name?.trim() ?? '',
    description: specialtyData.description?.trim() ?? '',
    status: specialtyData.status ?? 'active',
    professionalsCount: Number(specialtyData.professionalsCount) || 0,
    patientsInterested: Number(specialtyData.patientsInterested) || 0,
    activeVacancies: Number(specialtyData.activeVacancies) || 0,
    createdAt: new Date().toISOString(),
  };
};

const buildUpdatedSpecialtyFromData = (specialtyData, currentSpecialty) => ({
  ...currentSpecialty,
  name: specialtyData.name?.trim() ?? currentSpecialty.name,
  description:
    specialtyData.description?.trim() ?? currentSpecialty.description,
  status: specialtyData.status ?? currentSpecialty.status,
  professionalsCount:
    specialtyData.professionalsCount === undefined
      ? currentSpecialty.professionalsCount
      : Number(specialtyData.professionalsCount) || 0,
  patientsInterested:
    specialtyData.patientsInterested === undefined
      ? currentSpecialty.patientsInterested
      : Number(specialtyData.patientsInterested) || 0,
  activeVacancies:
    specialtyData.activeVacancies === undefined
      ? currentSpecialty.activeVacancies
      : Number(specialtyData.activeVacancies) || 0,
});

export default function SpecialtyProvider({ children }) {
  const [specialtyState, specialtyDispatch] = useReducer(
    specialtyReducer,
    specialtyInitialState,
  );

  const getSpecialties = async () => {
    specialtyDispatch({
      type: specialtyTypes.GET_ALL_SPECIALTIES_REQUEST,
    });

    try {
      const specialties = specialtyState.specialties;

      specialtyDispatch({
        type: specialtyTypes.GET_ALL_SPECIALTIES_SUCCESS,
        payload: { specialties },
      });

      return specialties;
    } catch (error) {
      specialtyDispatch({
        type: specialtyTypes.GET_ALL_SPECIALTIES_FAILURE,
        payload: { error: error.message },
      });

      return [];
    }
  };

  const createSpecialty = async (specialtyData) => {
    specialtyDispatch({
      type: specialtyTypes.CREATE_SPECIALTY_REQUEST,
    });

    try {
      const specialty = buildSpecialtyFromData(
        specialtyData,
        specialtyState.specialties,
      );

      specialtyDispatch({
        type: specialtyTypes.CREATE_SPECIALTY_SUCCESS,
        payload: { specialty },
      });

      return specialty;
    } catch (error) {
      specialtyDispatch({
        type: specialtyTypes.CREATE_SPECIALTY_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  const updateSpecialty = async (specialtyData, id) => {
    specialtyDispatch({
      type: specialtyTypes.UPDATE_SPECIALTY_REQUEST,
    });

    try {
      const currentSpecialty = specialtyState.specialties.find(
        (specialty) => String(specialty.id) === String(id),
      );

      if (!currentSpecialty) {
        throw new Error('Especialidade nao encontrada.');
      }

      const specialty = buildUpdatedSpecialtyFromData(
        specialtyData,
        currentSpecialty,
      );

      specialtyDispatch({
        type: specialtyTypes.UPDATE_SPECIALTY_SUCCESS,
        payload: { specialty, id },
      });

      return specialty;
    } catch (error) {
      specialtyDispatch({
        type: specialtyTypes.UPDATE_SPECIALTY_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  const deleteSpecialty = async (id) => {
    specialtyDispatch({
      type: specialtyTypes.DELETE_SPECIALTY_REQUEST,
    });

    try {
      const currentSpecialty = specialtyState.specialties.find(
        (specialty) => String(specialty.id) === String(id),
      );

      if (!currentSpecialty) {
        throw new Error('Especialidade nao encontrada.');
      }

      specialtyDispatch({
        type: specialtyTypes.DELETE_SPECIALTY_SUCCESS,
        payload: { id },
      });

      return id;
    } catch (error) {
      specialtyDispatch({
        type: specialtyTypes.DELETE_SPECIALTY_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  return (
    <SpecialtyContext.Provider
      value={{
        specialtyState,
        specialtyDispatch,
        getSpecialties,
        createSpecialty,
        updateSpecialty,
        deleteSpecialty,
      }}
    >
      {children}
    </SpecialtyContext.Provider>
  );
}
