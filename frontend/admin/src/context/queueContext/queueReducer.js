import { queueTypes } from './queueTypes';

const mergeQueuePayload = (state, action, extraState = {}) => ({
  ...state,
  appointmentRequests: action.payload.appointmentRequests,
  adminAppointmentRequests: action.payload.adminAppointmentRequests,
  patients: action.payload.patients,
  professionals: action.payload.professionals,
  specialties: action.payload.specialties,
  appointments: action.payload.appointments,
  warning: action.payload.warning,
  error: null,
  hasLoaded: true,
  ...extraState,
});

export const queueReducer = (state, action) => {
  switch (action.type) {
    case queueTypes.GET_QUEUE_REQUESTS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case queueTypes.CREATE_QUEUE_REQUEST_REQUEST:
    case queueTypes.UPDATE_QUEUE_REQUEST_REQUEST:
    case queueTypes.DELETE_QUEUE_REQUEST_REQUEST:
      return {
        ...state,
        isSubmitting: true,
        error: null,
      };

    case queueTypes.GET_QUEUE_REQUESTS_SUCCESS:
      return mergeQueuePayload(state, action, {
        isLoading: false,
      });

    case queueTypes.CREATE_QUEUE_REQUEST_SUCCESS:
    case queueTypes.UPDATE_QUEUE_REQUEST_SUCCESS:
    case queueTypes.DELETE_QUEUE_REQUEST_SUCCESS:
      return mergeQueuePayload(state, action, {
        isSubmitting: false,
      });

    case queueTypes.GET_QUEUE_REQUESTS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case queueTypes.CREATE_QUEUE_REQUEST_FAILURE:
    case queueTypes.UPDATE_QUEUE_REQUEST_FAILURE:
    case queueTypes.DELETE_QUEUE_REQUEST_FAILURE:
      return {
        ...state,
        isSubmitting: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
};
