import { useReducer } from 'react';

import * as patientApi from '../../api/patientApi';
import { patientContext } from './patientContext';
import { patientInitialState } from './patientInitialState';
import { patientReducer } from './patientReducer';
import * as patientTypes from './patientTypes';

export default function PatientProvider({ children }) {
  const [patientState, patientDispatch] = useReducer(
    patientReducer,
    patientInitialState,
  );

  const getPatients = async () => {
    patientDispatch({ type: patientTypes.GET_ALL_PATIENTS_REQUEST });

    try {
      const patients = await patientApi.getAllPatients();

      patientDispatch({
        type: patientTypes.GET_ALL_PATIENTS_SUCCESS,
        payload: {
          patients,
        },
      });

      return patients;
    } catch (error) {
      patientDispatch({
        type: patientTypes.GET_ALL_PATIENTS_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const getPatientById = async (patientId) => {
    return patientApi.getPatientById(patientId);
  };

  const createPatient = async (patientData) => {
    patientDispatch({ type: patientTypes.CREATE_PATIENT_REQUEST });

    try {
      const patient = await patientApi.createPatient(patientData);

      patientDispatch({
        type: patientTypes.CREATE_PATIENT_SUCCESS,
        payload: { patient },
      });

      await getPatients();

      return patient;
    } catch (error) {
      patientDispatch({
        type: patientTypes.CREATE_PATIENT_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const updatePatient = async (patientData, patientId) => {
    patientDispatch({ type: patientTypes.UPDATE_PATIENT_REQUEST });

    try {
      const patient = await patientApi.updatePatient(patientData, patientId);

      patientDispatch({
        type: patientTypes.UPDATE_PATIENT_SUCCESS,
        payload: { patient },
      });

      await getPatients();

      return patient;
    } catch (error) {
      patientDispatch({
        type: patientTypes.UPDATE_PATIENT_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const deletePatient = async (patientId) => {
    patientDispatch({ type: patientTypes.DELETE_PATIENT_REQUEST });

    try {
      await patientApi.deletePatient(patientId);

      patientDispatch({
        type: patientTypes.DELETE_PATIENT_SUCCESS,
        payload: { id: patientId },
      });

      await getPatients();

      return patientId;
    } catch (error) {
      patientDispatch({
        type: patientTypes.DELETE_PATIENT_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  return (
    <patientContext.Provider
      value={{
        patientState,
        patientDispatch,
        getPatients,
        getPatientById,
        createPatient,
        updatePatient,
        deletePatient,
      }}
    >
      {children}
    </patientContext.Provider>
  );
}
