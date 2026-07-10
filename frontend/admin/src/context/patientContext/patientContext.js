import { createContext, useContext } from 'react';

export const patientContext = createContext(null);

export const usePatients = () => {
  const context = useContext(patientContext);

  if (!context) {
    throw new Error('usePatients deve ser usado dentro de PatientProvider');
  }

  return context;
};
