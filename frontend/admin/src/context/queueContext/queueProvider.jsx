import { useState } from 'react';
import { queueContext } from './queueContext';
import {
  buildQueueRequestList,
  buildQueueSummary,
  createLookupById,
} from '../../data/queue';
import {
  createInitialQueueRequests,
  queuePatientsMock,
  queueProfessionalsMock,
  queueSpecialtiesMock,
  queueVacanciesMock,
} from '../../mocks/queueMock';

export default function QueueProvider({ children }) {
  const [queueRequests, setQueueRequests] = useState(() => createInitialQueueRequests());

  const patients = queuePatientsMock;
  const specialties = queueSpecialtiesMock;
  const professionals = queueProfessionalsMock;
  const vacancies = queueVacanciesMock;

  const patientsById = createLookupById(patients);
  const professionalsById = createLookupById(professionals);
  const specialtiesById = createLookupById(specialties);

  const queueRequestItems = buildQueueRequestList(queueRequests, {
    patientsById,
    professionalsById,
    specialtiesById,
    vacancies,
  });
  const summary = buildQueueSummary(queueRequestItems);

  const createQueueRequest = (formValues) => {
    const requestTimestamp = formValues.createdAt || new Date().toISOString();
    const currentHighestId = queueRequests.reduce(
      (highestId, queueRequest) => Math.max(highestId, Number(queueRequest.id) || 0),
      0,
    );
    const nextQueueRequest = {
      id: currentHighestId + 1,
      patientId: formValues.patientId,
      specialityId: formValues.specialityId,
      doctorId: formValues.doctorId,
      status: 'waiting',
      createdAt: requestTimestamp,
      updatedAt: requestTimestamp,
    };

    setQueueRequests((currentQueueRequests) => [
      nextQueueRequest,
      ...currentQueueRequests,
    ]);

    return nextQueueRequest;
  };

  const updateQueueRequest = (queueRequestId, formValues) => {
    const normalizedQueueRequestId = Number(queueRequestId);

    setQueueRequests((currentQueueRequests) => (
      currentQueueRequests.map((queueRequest) => (
        Number(queueRequest.id) === normalizedQueueRequestId
          ? {
            ...queueRequest,
            specialityId: formValues.specialityId,
            doctorId: formValues.doctorId,
            status: formValues.status,
            updatedAt: new Date().toISOString(),
          }
          : queueRequest
      ))
    ));
  };

  const cancelQueueRequest = (queueRequestId) => {
    const normalizedQueueRequestId = Number(queueRequestId);

    setQueueRequests((currentQueueRequests) => (
      currentQueueRequests.map((queueRequest) => (
        Number(queueRequest.id) === normalizedQueueRequestId
          ? {
            ...queueRequest,
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          }
          : queueRequest
      ))
    ));
  };

  const getQueueRequestById = (queueRequestId) => (
    queueRequestItems.find(
      (queueRequest) => Number(queueRequest.id) === Number(queueRequestId),
    ) ?? null
  );

  return (
    <queueContext.Provider
      value={{
        queueRequests,
        queueRequestItems,
        summary,
        patients,
        specialties,
        professionals,
        vacancies,
        createQueueRequest,
        updateQueueRequest,
        cancelQueueRequest,
        getQueueRequestById,
      }}
    >
      {children}
    </queueContext.Provider>
  );
}
