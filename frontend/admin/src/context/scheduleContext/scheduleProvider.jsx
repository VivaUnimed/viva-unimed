import { useReducer } from 'react';
import { scheduleContext as ScheduleContext } from './scheduleContext';
import { scheduleInitialState } from './scheduleInitialState';
import { scheduleReducer } from './scheduleReducer';
import { scheduleTypes } from './scheduleTypes';

const buildAppointmentFromData = (
  appointmentData,
  existingAppointments = [],
) => {
  const nextId =
    existingAppointments.reduce(
      (highestId, appointment) =>
        Math.max(highestId, Number(appointment.id) || 0),
      0,
    ) + 1;

  return {
    id: nextId,
    date: appointmentData.date ?? '',
    time: appointmentData.time ?? '',
    type: appointmentData.type ?? '',
    patient: appointmentData.patient ?? '',
    details: appointmentData.details ?? '',
    specialty: appointmentData.specialty ?? '',
    professional: appointmentData.professional ?? '',
    status: appointmentData.status ?? 'free',
    createdAt: new Date().toISOString(),
  };
};

const buildUpdatedAppointmentFromData = (
  appointmentData,
  currentAppointment,
) => ({
  ...currentAppointment,
  ...appointmentData,
});

export default function ScheduleProvider({ children }) {
  const [scheduleState, scheduleDispatch] = useReducer(
    scheduleReducer,
    scheduleInitialState,
  );

  const getAppointments = async () => {
    scheduleDispatch({
      type: scheduleTypes.GET_ALL_APPOINTMENTS_REQUEST,
    });

    try {
      const appointments = scheduleState.appointments;

      scheduleDispatch({
        type: scheduleTypes.GET_ALL_APPOINTMENTS_SUCCESS,
        payload: { appointments },
      });

      return appointments;
    } catch (error) {
      scheduleDispatch({
        type: scheduleTypes.GET_ALL_APPOINTMENTS_FAILURE,
        payload: { error: error.message },
      });

      return [];
    }
  };

  const createAppointment = async (appointmentData) => {
    scheduleDispatch({
      type: scheduleTypes.CREATE_APPOINTMENT_REQUEST,
    });

    try {
      const appointment = buildAppointmentFromData(
        appointmentData,
        scheduleState.appointments,
      );

      scheduleDispatch({
        type: scheduleTypes.CREATE_APPOINTMENT_SUCCESS,
        payload: { appointment },
      });

      return appointment;
    } catch (error) {
      scheduleDispatch({
        type: scheduleTypes.CREATE_APPOINTMENT_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  const updateAppointment = async (appointmentData, id) => {
    scheduleDispatch({
      type: scheduleTypes.UPDATE_APPOINTMENT_REQUEST,
    });

    try {
      const currentAppointment = scheduleState.appointments.find(
        (appointment) => String(appointment.id) === String(id),
      );

      if (!currentAppointment) {
        throw new Error('Registro de agenda nao encontrado.');
      }

      const appointment = buildUpdatedAppointmentFromData(
        appointmentData,
        currentAppointment,
      );

      scheduleDispatch({
        type: scheduleTypes.UPDATE_APPOINTMENT_SUCCESS,
        payload: { appointment, id },
      });

      return appointment;
    } catch (error) {
      scheduleDispatch({
        type: scheduleTypes.UPDATE_APPOINTMENT_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  const deleteAppointment = async (id) => {
    scheduleDispatch({
      type: scheduleTypes.DELETE_APPOINTMENT_REQUEST,
    });

    try {
      const currentAppointment = scheduleState.appointments.find(
        (appointment) => String(appointment.id) === String(id),
      );

      if (!currentAppointment) {
        throw new Error('Registro de agenda nao encontrado.');
      }

      scheduleDispatch({
        type: scheduleTypes.DELETE_APPOINTMENT_SUCCESS,
        payload: { id },
      });

      return id;
    } catch (error) {
      scheduleDispatch({
        type: scheduleTypes.DELETE_APPOINTMENT_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  const setScheduleView = (currentView) => {
    scheduleDispatch({
      type: scheduleTypes.SET_SCHEDULE_VIEW,
      payload: { currentView },
    });
  };

  const setSelectedDate = (selectedDate) => {
    scheduleDispatch({
      type: scheduleTypes.SET_SCHEDULE_SELECTED_DATE,
      payload: { selectedDate },
    });
  };

  const setScheduleFilters = (filters) => {
    scheduleDispatch({
      type: scheduleTypes.SET_SCHEDULE_FILTERS,
      payload: { filters },
    });
  };

  const resetScheduleFilters = () => {
    scheduleDispatch({
      type: scheduleTypes.RESET_SCHEDULE_FILTERS,
    });
  };

  return (
    <ScheduleContext.Provider
      value={{
        scheduleState,
        scheduleDispatch,
        getAppointments,
        createAppointment,
        updateAppointment,
        deleteAppointment,
        setScheduleView,
        setSelectedDate,
        setScheduleFilters,
        resetScheduleFilters,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}
