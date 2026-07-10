import { defaultPatients } from '../../data/patients';

export const patientInitialState = {
  patients: defaultPatients,
  isLoading: false,
  error: null,
};
