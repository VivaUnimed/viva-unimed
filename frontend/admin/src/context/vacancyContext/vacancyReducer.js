import { vacancyTypes } from './vacancyTypes';

export const vacancyReducer = (state, action) => {
  switch (action.type) {
    case vacancyTypes.GET_ALL_VACANCIES_REQUEST:
    case vacancyTypes.CREATE_VACANCY_REQUEST:
    case vacancyTypes.UPDATE_VACANCY_REQUEST:
    case vacancyTypes.DELETE_VACANCY_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case vacancyTypes.GET_ALL_VACANCIES_SUCCESS:
      return {
        ...state,
        vacancies: action.payload.vacancies,
        isLoading: false,
        error: null,
      };

    case vacancyTypes.CREATE_VACANCY_SUCCESS:
      return {
        ...state,
        vacancies: [action.payload.vacancy, ...state.vacancies],
        isLoading: false,
        error: null,
      };

    case vacancyTypes.UPDATE_VACANCY_SUCCESS:
      return {
        ...state,
        vacancies: state.vacancies.map((vacancy) =>
          String(vacancy.id) === String(action.payload.id)
            ? action.payload.vacancy
            : vacancy,
        ),
        isLoading: false,
        error: null,
      };

    case vacancyTypes.DELETE_VACANCY_SUCCESS:
      return {
        ...state,
        vacancies: state.vacancies.filter(
          (vacancy) => String(vacancy.id) !== String(action.payload.id),
        ),
        isLoading: false,
        error: null,
      };

    case vacancyTypes.GET_ALL_VACANCIES_FAILURE:
    case vacancyTypes.CREATE_VACANCY_FAILURE:
    case vacancyTypes.UPDATE_VACANCY_FAILURE:
    case vacancyTypes.DELETE_VACANCY_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
};
