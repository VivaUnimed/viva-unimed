import { createContext, useContext } from 'react';

export const vacancyContext = createContext(null);

export const useVacancies = () => {
  const context = useContext(vacancyContext);

  if (!context) {
    throw new Error('useVacancies deve ser usado dentro de VacancyProvider');
  }

  return context;
};
