import { useEffect, useReducer } from 'react';
import { patientContext as PatientContext } from './patientContext';
import { patientReducer } from './patientReducer';
import { patientInitialState } from './patientInitialState';
import { patientTypes } from './patientTypes';
import {
  buildPatientFromForm,
  buildUpdatedPatientFromForm,
} from '../../data/patients';

const PATIENTS_STORAGE_KEY = 'vivaunimed:patients';

const getInitialPatientState = (baseState) => {
  if (typeof window === 'undefined') {
    return baseState;
  }

  try {
    const storedPatients = window.localStorage.getItem(PATIENTS_STORAGE_KEY);

    if (!storedPatients) {
      return baseState;
    }

    const parsedPatients = JSON.parse(storedPatients);

    if (!Array.isArray(parsedPatients) || parsedPatients.length === 0) {
      return baseState;
    }

    return {
      ...baseState,
      patients: parsedPatients,
    };
  } catch {
    return baseState;
  }
};

export default function PatientProvider({ children }) {
  const [patientState, patientDispatch] = useReducer(
    patientReducer,
    patientInitialState,
    getInitialPatientState,
  );

  useEffect(() => {
    window.localStorage.setItem(
      PATIENTS_STORAGE_KEY,
      JSON.stringify(patientState.patients),
    );
  }, [patientState.patients]);

  const getPatients = () => {
    patientDispatch({ type: patientTypes.GET_ALL_PATIENTS_REQUEST });

    try {
      const patients = patientState.patients;

      patientDispatch({
        type: patientTypes.GET_ALL_PATIENTS_SUCCESS,
        payload: { patients },
      });

      return patients;
    } catch (error) {
      patientDispatch({
        type: patientTypes.GET_ALL_PATIENTS_FAILURE,
        payload: { error: error.message },
      });

      return [];
    }
  };

  const createPatient = (newPatient) => {
    patientDispatch({ type: patientTypes.CREATE_PATIENT_REQUEST });

    try {
      const patient = buildPatientFromForm(newPatient, patientState.patients);

      patientDispatch({
        type: patientTypes.CREATE_PATIENT_SUCCESS,
        payload: { patient },
      });

      return patient;
    } catch (error) {
      patientDispatch({
        type: patientTypes.CREATE_PATIENT_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  const updatePatient = (patientId, updatedPatientData) => {
    patientDispatch({ type: patientTypes.UPDATE_PATIENT_REQUEST });

    try {
      const currentPatient = patientState.patients.find(
        (patient) => String(patient.id) === String(patientId),
      );

      if (!currentPatient) {
        throw new Error('Paciente nao encontrado.');
      }

      const patient = buildUpdatedPatientFromForm(
        updatedPatientData,
        currentPatient,
      );

      patientDispatch({
        type: patientTypes.UPDATE_PATIENT_SUCCESS,
        payload: { patient },
      });

      return patient;
    } catch (error) {
      patientDispatch({
        type: patientTypes.UPDATE_PATIENT_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  const deletePatient = (patientId) => {
    patientDispatch({ type: patientTypes.DELETE_PATIENT_REQUEST });

    try {
      const currentPatient = patientState.patients.find(
        (patient) => String(patient.id) === String(patientId),
      );

      if (!currentPatient) {
        throw new Error('Paciente nao encontrado.');
      }

      patientDispatch({
        type: patientTypes.DELETE_PATIENT_SUCCESS,
        payload: { id: patientId },
      });

      return patientId;
    } catch (error) {
      patientDispatch({
        type: patientTypes.DELETE_PATIENT_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  return (
    <PatientContext.Provider
      value={{
        patientState,
        patientDispatch,
        getPatients,
        createPatient,
        updatePatient,
        deletePatient,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}
