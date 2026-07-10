import { scheduleTypes } from './scheduleTypes';

export const scheduleReducer = (state, action) => {
  switch (action.type) {
    case scheduleTypes.GET_ALL_APPOINTMENTS_REQUEST:
    case scheduleTypes.CREATE_APPOINTMENT_REQUEST:
    case scheduleTypes.UPDATE_APPOINTMENT_REQUEST:
    case scheduleTypes.DELETE_APPOINTMENT_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case scheduleTypes.GET_ALL_APPOINTMENTS_SUCCESS:
      return {
        ...state,
        appointments: action.payload.appointments,
        isLoading: false,
        error: null,
      };

    case scheduleTypes.CREATE_APPOINTMENT_SUCCESS:
      return {
        ...state,
        appointments: [action.payload.appointment, ...state.appointments],
        isLoading: false,
        error: null,
      };

    case scheduleTypes.UPDATE_APPOINTMENT_SUCCESS:
      return {
        ...state,
        appointments: state.appointments.map((appointment) =>
          String(appointment.id) === String(action.payload.id)
            ? action.payload.appointment
            : appointment,
        ),
        isLoading: false,
        error: null,
      };

    case scheduleTypes.DELETE_APPOINTMENT_SUCCESS:
      return {
        ...state,
        appointments: state.appointments.filter(
          (appointment) => String(appointment.id) !== String(action.payload.id),
        ),
        isLoading: false,
        error: null,
      };

    case scheduleTypes.SET_SCHEDULE_VIEW:
      return {
        ...state,
        currentView: action.payload.currentView,
      };

    case scheduleTypes.SET_SCHEDULE_SELECTED_DATE:
      return {
        ...state,
        selectedDate: action.payload.selectedDate,
      };

    case scheduleTypes.SET_SCHEDULE_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload.filters,
        },
      };

    case scheduleTypes.RESET_SCHEDULE_FILTERS:
      return {
        ...state,
        filters: {
          specialty: '',
          professional: '',
          status: '',
        },
      };

    case scheduleTypes.GET_ALL_APPOINTMENTS_FAILURE:
    case scheduleTypes.CREATE_APPOINTMENT_FAILURE:
    case scheduleTypes.UPDATE_APPOINTMENT_FAILURE:
    case scheduleTypes.DELETE_APPOINTMENT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
};
