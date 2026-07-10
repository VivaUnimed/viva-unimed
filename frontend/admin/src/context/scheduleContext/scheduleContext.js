import { createContext, useContext } from 'react';

export const scheduleContext = createContext(null);

export const useSchedule = () => {
  const context = useContext(scheduleContext);

  if (!context) {
    throw new Error('useSchedule deve ser usado dentro de ScheduleProvider');
  }

  return context;
};
