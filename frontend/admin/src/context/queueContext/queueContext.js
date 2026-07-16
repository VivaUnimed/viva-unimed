import { createContext, useContext } from 'react';

export const queueContext = createContext(null);

export const useQueue = () => {
  const context = useContext(queueContext);

  if (!context) {
    throw new Error('useQueue deve ser usado dentro de QueueProvider');
  }

  return context;
};
