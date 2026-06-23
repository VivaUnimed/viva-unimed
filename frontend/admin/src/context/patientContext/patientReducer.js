import { patientTypes } from './patientTypes';

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
        patients: action.payload.patients,
        isLoading: false,
        error: null,
      };

    case patientTypes.CREATE_PATIENT:
    case patientTypes.CREATE_PATIENT_SUCCESS:
      return {
        ...state,
        patients: [action.payload.patient, ...state.patients],
        isLoading: false,
        error: null,
      };

    case patientTypes.UPDATE_PATIENT:
    case patientTypes.UPDATE_PATIENT_SUCCESS:
      return {
        ...state,
        patients: state.patients.map((patient) =>
          String(patient.id) === String(action.payload.patient.id)
            ? action.payload.patient
            : patient,
        ),
        isLoading: false,
        error: null,
      };

    case patientTypes.DELETE_PATIENT:
    case patientTypes.DELETE_PATIENT_SUCCESS:
      return {
        ...state,
        patients: state.patients.filter(
          (patient) => String(patient.id) !== String(action.payload.id),
        ),
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
        error: action.payload.error,
      };

    default:
      return state;
  }
};
