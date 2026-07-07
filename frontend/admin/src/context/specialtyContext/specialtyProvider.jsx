import { useReducer } from 'react';

import * as specialityApi from '../../api/specialityApi';
import { specialtyContext as SpecialtyContext } from './specialtyContext';
import { specialtyInitialState } from './specialtyInitialState';
import { specialtyReducer } from './specialtyReducer';

export default function SpecialtyProvider({ children }) {
  const [specialtyState, specialtyDispatch] = useReducer(
    specialtyReducer,
    specialtyInitialState,
  );

  const getSpecialties = async () => {
    return await specialityApi.getAllSpecialties(specialtyDispatch);
  };

  const createSpecialty = async (specialtyData) => {
    return await specialityApi.createSpecialty(specialtyData, specialtyDispatch);
  };

  const updateSpecialty = async (specialtyData, id) => {
    return await specialityApi.updateSpecialty(
      specialtyData,
      id,
      specialtyDispatch,
    );
  };

  const deleteSpecialty = async (id) => {
    return await specialityApi.deleteSpecialty(id, specialtyDispatch);
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
