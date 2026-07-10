import { getGeneratedVacancies } from '../../data/vacancies';

export const vacancyInitialState = {
  vacancies: getGeneratedVacancies(),
  isLoading: false,
  error: null,
};
