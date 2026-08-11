import { useReducer } from 'react';
import { queueContext as QueueContext } from './queueContext';
import { queueInitialState } from './queueInitialState';
import { queueReducer } from './queueReducer';
import { queueTypes } from './queueTypes';
import {
  createAppointmentRequest,
  deleteAppointmentRequest,
  getAllAppointmentRequests,
  updateAppointmentRequest,
} from '../../api/appointmentRequestApi';
import { getAllAppointments } from '../../api/appointmentApi';
import { getAllDoctors } from '../../api/doctorApi';
import { getAllPatients } from '../../api/patientApi';
import { getAllSpecialties } from '../../api/specialityApi';
import {
  buildAdminAppointmentRequests,
  buildQueueSummary,
  createLookupById,
} from '../../data/queue';

const auxiliaryResourceLabels = {
  patients: 'pacientes',
  professionals: 'profissionais',
  specialties: 'especialidades',
  appointments: 'vagas',
};

const createAuxiliaryFallback = (error) => ({
  data: [],
  error,
});

const createAuxiliarySuccess = (data) => ({
  data,
  error: null,
});

const formatResourceList = (resourceKeys = []) => {
  const labels = resourceKeys
    .map((resourceKey) => auxiliaryResourceLabels[resourceKey])
    .filter(Boolean);

  if (!labels.length) {
    return '';
  }

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} e ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(', ')} e ${labels.at(-1)}`;
};

const buildAuxiliaryWarning = (failedResources = []) => {
  if (!failedResources.length) {
    return null;
  }

  return `Alguns dados auxiliares não puderam ser carregados (${formatResourceList(failedResources)}). A tela segue com informações parciais.`;
};

const loadAuxiliaryResources = async () => {
  const [
    patientsResult,
    professionalsResult,
    specialtiesResult,
    appointmentsResult,
  ] = await Promise.all([
    getAllPatients()
      .then((patients) => createAuxiliarySuccess(patients))
      .catch((error) => createAuxiliaryFallback(error)),
    getAllDoctors()
      .then((professionals) => createAuxiliarySuccess(professionals))
      .catch((error) => createAuxiliaryFallback(error)),
    getAllSpecialties()
      .then((specialties) => createAuxiliarySuccess(specialties))
      .catch((error) => createAuxiliaryFallback(error)),
    getAllAppointments()
      .then((appointments) => createAuxiliarySuccess(appointments))
      .catch((error) => createAuxiliaryFallback(error)),
  ]);

  const failedResources = [
    patientsResult.error ? 'patients' : null,
    professionalsResult.error ? 'professionals' : null,
    specialtiesResult.error ? 'specialties' : null,
    appointmentsResult.error ? 'appointments' : null,
  ].filter(Boolean);

  return {
    patients: patientsResult.data,
    professionals: professionalsResult.data,
    specialties: specialtiesResult.data,
    appointments: appointmentsResult.data,
    warning: buildAuxiliaryWarning(failedResources),
  };
};

const buildQueueStatePayload = async () => {
  const appointmentRequests = await getAllAppointmentRequests();
  const auxiliaryResources = await loadAuxiliaryResources();
  const patientsById = createLookupById(auxiliaryResources.patients);
  const professionalsById = createLookupById(auxiliaryResources.professionals);
  const specialtiesById = createLookupById(auxiliaryResources.specialties);
  const adminAppointmentRequests = buildAdminAppointmentRequests(appointmentRequests, {
    patientsById,
    professionalsById,
    specialtiesById,
    vacancies: auxiliaryResources.appointments,
  });

  return {
    appointmentRequests,
    adminAppointmentRequests,
    patients: auxiliaryResources.patients,
    professionals: auxiliaryResources.professionals,
    specialties: auxiliaryResources.specialties,
    appointments: auxiliaryResources.appointments,
    warning: auxiliaryResources.warning,
  };
};

export default function QueueProvider({ children }) {
  const [queueState, queueDispatch] = useReducer(queueReducer, queueInitialState);

  const getQueueRequests = async () => {
    queueDispatch({
      type: queueTypes.GET_QUEUE_REQUESTS_REQUEST,
    });

    try {
      const payload = await buildQueueStatePayload();

      queueDispatch({
        type: queueTypes.GET_QUEUE_REQUESTS_SUCCESS,
        payload,
      });

      return payload.adminAppointmentRequests;
    } catch (error) {
      queueDispatch({
        type: queueTypes.GET_QUEUE_REQUESTS_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const createQueueRequest = async (requestData) => {
    queueDispatch({
      type: queueTypes.CREATE_QUEUE_REQUEST_REQUEST,
    });

    try {
      await createAppointmentRequest(requestData);
      const payload = await buildQueueStatePayload();

      queueDispatch({
        type: queueTypes.CREATE_QUEUE_REQUEST_SUCCESS,
        payload,
      });

      return payload.adminAppointmentRequests;
    } catch (error) {
      queueDispatch({
        type: queueTypes.CREATE_QUEUE_REQUEST_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const updateQueueRequest = async (queueRequestId, requestData) => {
    queueDispatch({
      type: queueTypes.UPDATE_QUEUE_REQUEST_REQUEST,
    });

    try {
      await updateAppointmentRequest(queueRequestId, requestData);
      const payload = await buildQueueStatePayload();

      queueDispatch({
        type: queueTypes.UPDATE_QUEUE_REQUEST_SUCCESS,
        payload,
      });

      return payload.adminAppointmentRequests;
    } catch (error) {
      queueDispatch({
        type: queueTypes.UPDATE_QUEUE_REQUEST_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const removeQueueRequest = async (queueRequestId) => {
    queueDispatch({
      type: queueTypes.DELETE_QUEUE_REQUEST_REQUEST,
    });

    try {
      await deleteAppointmentRequest(queueRequestId);
      const payload = await buildQueueStatePayload();

      queueDispatch({
        type: queueTypes.DELETE_QUEUE_REQUEST_SUCCESS,
        payload,
      });

      return payload.adminAppointmentRequests;
    } catch (error) {
      queueDispatch({
        type: queueTypes.DELETE_QUEUE_REQUEST_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const getQueueRequestById = (queueRequestId) => (
    queueState.adminAppointmentRequests.find(
      (queueRequest) => Number(queueRequest.id) === Number(queueRequestId),
    ) ?? null
  );

  const summary = buildQueueSummary(queueState.adminAppointmentRequests);

  return (
    <QueueContext.Provider
      value={{
        queueState,
        appointmentRequests: queueState.appointmentRequests,
        adminAppointmentRequests: queueState.adminAppointmentRequests,
        queueRequests: queueState.appointmentRequests,
        queueRequestItems: queueState.adminAppointmentRequests,
        patients: queueState.patients,
        specialties: queueState.specialties,
        professionals: queueState.professionals,
        appointments: queueState.appointments,
        summary,
        getQueueRequests,
        createQueueRequest,
        updateQueueRequest,
        deleteQueueRequest: removeQueueRequest,
        cancelQueueRequest: removeQueueRequest,
        getQueueRequestById,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}
