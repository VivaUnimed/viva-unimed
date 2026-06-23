import { createContext, useContext } from 'react';

export const specialtyContext = createContext(null);

export const useSpecialties = () => {
  const context = useContext(specialtyContext);

  if (!context) {
    throw new Error('useSpecialties deve ser usado dentro de SpecialtyProvider');
  }

  return context;
};
