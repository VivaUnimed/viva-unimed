import { createContext, useContext } from 'react';

export const professionalContext = createContext(null);

export const useProfessionals = () => {
  const context = useContext(professionalContext);

  if (!context) {
    throw new Error(
      'useProfessionals deve ser usado dentro de ProfessionalProvider',
    );
  }

  return context;
};
