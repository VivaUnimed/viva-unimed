import { useReducer } from 'react';
import { vacancyContext as VacancyContext } from './vacancyContext';
import { vacancyInitialState } from './vacancyInitialState';
import { vacancyReducer } from './vacancyReducer';
import { vacancyTypes } from './vacancyTypes';

const buildVacancyFromData = (vacancyData, existingVacancies = []) => {
  const nextId =
    existingVacancies.reduce(
      (highestId, vacancy) => Math.max(highestId, Number(vacancy.id) || 0),
      0,
    ) + 1;

  return {
    id: nextId,
    time: vacancyData.time ?? '',
    date: vacancyData.date ?? '',
    specialty: vacancyData.specialty ?? '',
    professional: vacancyData.professional ?? '',
    unit: vacancyData.unit ?? '',
    type: vacancyData.type ?? '',
    queuePatients: Number(vacancyData.queuePatients) || 0,
    vacancyStatus: vacancyData.vacancyStatus ?? 'open',
    vacancyStatusText: vacancyData.vacancyStatusText ?? 'Aberta',
    dispatchStatus: vacancyData.dispatchStatus ?? 'success',
    dispatchStatusText:
      vacancyData.dispatchStatusText ?? 'Enviado com sucesso',
    expiration: vacancyData.expiration ?? '',
    confirmedPatient: vacancyData.confirmedPatient ?? null,
    acceptanceTimestamp: vacancyData.acceptanceTimestamp ?? null,
    finalDescription: vacancyData.finalDescription ?? '',
    history: Array.isArray(vacancyData.history) ? vacancyData.history : [],
    createdAt: new Date().toISOString(),
  };
};

const buildUpdatedVacancyFromData = (vacancyData, currentVacancy) => ({
  ...currentVacancy,
  ...vacancyData,
  queuePatients:
    vacancyData.queuePatients === undefined
      ? currentVacancy.queuePatients
      : Number(vacancyData.queuePatients) || 0,
  history: Array.isArray(vacancyData.history)
    ? vacancyData.history
    : currentVacancy.history,
});

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
      const vacancies = vacancyState.vacancies;

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

      return [];
    }
  };

  const createVacancy = async (vacancyData) => {
    vacancyDispatch({
      type: vacancyTypes.CREATE_VACANCY_REQUEST,
    });

    try {
      const vacancy = buildVacancyFromData(
        vacancyData,
        vacancyState.vacancies,
      );

      vacancyDispatch({
        type: vacancyTypes.CREATE_VACANCY_SUCCESS,
        payload: { vacancy },
      });

      return vacancy;
    } catch (error) {
      vacancyDispatch({
        type: vacancyTypes.CREATE_VACANCY_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  const updateVacancy = async (vacancyData, id) => {
    vacancyDispatch({
      type: vacancyTypes.UPDATE_VACANCY_REQUEST,
    });

    try {
      const currentVacancy = vacancyState.vacancies.find(
        (vacancy) => String(vacancy.id) === String(id),
      );

      if (!currentVacancy) {
        throw new Error('Vaga nao encontrada.');
      }

      const vacancy = buildUpdatedVacancyFromData(vacancyData, currentVacancy);

      vacancyDispatch({
        type: vacancyTypes.UPDATE_VACANCY_SUCCESS,
        payload: { vacancy, id },
      });

      return vacancy;
    } catch (error) {
      vacancyDispatch({
        type: vacancyTypes.UPDATE_VACANCY_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  const deleteVacancy = async (id) => {
    vacancyDispatch({
      type: vacancyTypes.DELETE_VACANCY_REQUEST,
    });

    try {
      const currentVacancy = vacancyState.vacancies.find(
        (vacancy) => String(vacancy.id) === String(id),
      );

      if (!currentVacancy) {
        throw new Error('Vaga nao encontrada.');
      }

      vacancyDispatch({
        type: vacancyTypes.DELETE_VACANCY_SUCCESS,
        payload: { id },
      });

      return id;
    } catch (error) {
      vacancyDispatch({
        type: vacancyTypes.DELETE_VACANCY_FAILURE,
        payload: { error: error.message },
      });

      return null;
    }
  };

  return (
    <VacancyContext.Provider
      value={{
        vacancyState,
        vacancyDispatch,
        getVacancies,
        createVacancy,
        updateVacancy,
        deleteVacancy,
      }}
    >
      {children}
    </VacancyContext.Provider>
  );
}
