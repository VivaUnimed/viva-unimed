import * as patientTypes from './patientTypes';

export const patientReducer = (state, action) => {
  switch (action.type) {
    case patientTypes.GET_ALL_PATIENTS_REQUEST:
    case patientTypes.CREATE_PATIENT_REQUEST:
    case patientTypes.UPDATE_PATIENT_REQUEST:
    case patientTypes.DELETE_PATIENT_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case patientTypes.GET_ALL_PATIENTS_SUCCESS:
      return {
        ...state,
        patients: action.payload?.patients ?? [],
        isLoading: false,
        error: null,
      };

    case patientTypes.GET_ALL_PATIENTS_FAILURE:
    case patientTypes.CREATE_PATIENT_FAILURE:
    case patientTypes.UPDATE_PATIENT_FAILURE:
    case patientTypes.DELETE_PATIENT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload?.error ?? null,
      };

    case patientTypes.CREATE_PATIENT_SUCCESS:
    case patientTypes.UPDATE_PATIENT_SUCCESS:
    case patientTypes.DELETE_PATIENT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
};
