import { useReducer } from 'react';
import { vacancyContext as VacancyContext } from './vacancyContext';
import { vacancyInitialState } from './vacancyInitialState';
import { vacancyReducer } from './vacancyReducer';
import { vacancyTypes } from './vacancyTypes';
import {
  createAppointment,
  deleteAppointment,
  getAllAppointments,
  getAppointmentById,
} from '../../api/appointmentApi';
import { getAllAppointmentRequests } from '../../api/appointmentRequestApi';
import { getAllDoctors, getProfessionalById } from '../../api/doctorApi';
import { getAllPatients } from '../../api/patientApi';
import { getAllSpecialties, getSpecialtyById } from '../../api/specialityApi';
import { getUserById } from '../../api/userApi';
import {
  buildVacancyFromAppointment,
  buildVacancyList,
  buildVacancyQueueItems,
  createLookupById,
  getVacancyQueueRequests,
} from '../../data/vacancies';

const normalizeSpecialityEntity = (specialityData) => (
  specialityData?.speciality ?? specialityData?.specialty ?? specialityData ?? null
);

const normalizeUserEntity = (userData) => userData?.user ?? userData ?? null;

const loadVacanciesFromBackend = async () => {
  const appointments = await getAllAppointments();
  const [professionals, specialties, waitingRequests] = await Promise.all([
    getAllDoctors().catch(() => []),
    getAllSpecialties().catch(() => []),
    getAllAppointmentRequests({ status: 'waiting' }).catch(() => []),
  ]);

  return buildVacancyList(appointments, {
    professionalsById: createLookupById(professionals),
    specialtiesById: createLookupById(specialties),
    requests: waitingRequests,
  });
};

export default function VacancyProvider({ children }) {
  const [vacancyState, vacancyDispatch] = useReducer(
    vacancyReducer,
    vacancyInitialState,
  );

  const getVacancies = async () => {
    vacancyDispatch({
      type: vacancyTypes.GET_ALL_VACANCIES_REQUEST,
    });

    try {
      const vacancies = await loadVacanciesFromBackend();

      vacancyDispatch({
        type: vacancyTypes.GET_ALL_VACANCIES_SUCCESS,
        payload: { vacancies },
      });

      return vacancies;
    } catch (error) {
      vacancyDispatch({
        type: vacancyTypes.GET_ALL_VACANCIES_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const getVacancyById = async (vacancyId) => {
    const appointment = await getAppointmentById(vacancyId);
    const [professional, specialityData, createdByUserData, waitingRequests] = await Promise.all([
      getProfessionalById(appointment.doctorId).catch(() => null),
      getSpecialtyById(appointment.specialityId).catch(() => null),
      getUserById(appointment.createdBy).catch(() => null),
      getAllAppointmentRequests({
        status: 'waiting',
        specialityId: appointment.specialityId,
      }).catch(() => []),
    ]);
    const matchingRequests = getVacancyQueueRequests(appointment, waitingRequests);
    const patients = matchingRequests.length > 0
      ? await getAllPatients().catch(() => [])
      : [];
    const queueRequests = buildVacancyQueueItems(
      appointment,
      waitingRequests,
      createLookupById(patients),
    );
    const vacancy = buildVacancyFromAppointment(appointment, {
      professionalsById: createLookupById(professional ? [professional] : []),
      specialtiesById: createLookupById(
        normalizeSpecialityEntity(specialityData)
          ? [normalizeSpecialityEntity(specialityData)]
          : [],
      ),
      requests: waitingRequests,
    });
    const createdByUser = normalizeUserEntity(createdByUserData);

    return {
      ...vacancy,
      createdByName: createdByUser?.name ?? vacancy.createdByLabel,
      createdByEmail: createdByUser?.email ?? '',
      queueRequests,
    };
  };

  const createVacancy = async (vacancyData) => {
    vacancyDispatch({
      type: vacancyTypes.CREATE_VACANCY_REQUEST,
    });

    try {
      const vacancy = await createAppointment(vacancyData);

      vacancyDispatch({
        type: vacancyTypes.CREATE_VACANCY_SUCCESS,
      });

      return vacancy;
    } catch (error) {
      vacancyDispatch({
        type: vacancyTypes.CREATE_VACANCY_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const updateVacancy = async () => {
    vacancyDispatch({
      type: vacancyTypes.UPDATE_VACANCY_REQUEST,
    });

    try {
      throw new Error('O backend atual não permite editar vagas por rota administrativa.');
    } catch (error) {
      vacancyDispatch({
        type: vacancyTypes.UPDATE_VACANCY_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  const deleteVacancy = async (vacancyId) => {
    vacancyDispatch({
      type: vacancyTypes.DELETE_VACANCY_REQUEST,
    });

    try {
      await deleteAppointment(vacancyId);

      vacancyDispatch({
        type: vacancyTypes.DELETE_VACANCY_SUCCESS,
        payload: { id: vacancyId },
      });

      return vacancyId;
    } catch (error) {
      vacancyDispatch({
        type: vacancyTypes.DELETE_VACANCY_FAILURE,
        payload: { error: error.message },
      });

      throw error;
    }
  };

  return (
    <VacancyContext.Provider
      value={{
        vacancyState,
        vacancyDispatch,
        getVacancies,
        getVacancyById,
        createVacancy,
        updateVacancy,
        deleteVacancy,
      }}
    >
      {children}
    </VacancyContext.Provider>
  );
}
