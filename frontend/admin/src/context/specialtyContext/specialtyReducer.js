import { specialtyTypes } from './specialtyTypes';

export const specialtyReducer = (state, action) => {
  switch (action.type) {
    case specialtyTypes.GET_ALL_SPECIALTIES_REQUEST:
    case specialtyTypes.CREATE_SPECIALTY_REQUEST:
    case specialtyTypes.UPDATE_SPECIALTY_REQUEST:
    case specialtyTypes.DELETE_SPECIALTY_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case specialtyTypes.GET_ALL_SPECIALTIES_SUCCESS:
      return {
        ...state,
        specialties: action.payload.specialties,
        isLoading: false,
        error: null,
      };

    case specialtyTypes.CREATE_SPECIALTY_SUCCESS:
      return {
        ...state,
        specialties: [action.payload.specialty, ...state.specialties],
        isLoading: false,
        error: null,
      };

    case specialtyTypes.UPDATE_SPECIALTY_SUCCESS:
      return {
        ...state,
        specialties: state.specialties.map((specialty) =>
          String(specialty.id) === String(action.payload.id)
            ? action.payload.specialty
            : specialty,
        ),
        isLoading: false,
        error: null,
      };

    case specialtyTypes.DELETE_SPECIALTY_SUCCESS:
      return {
        ...state,
        specialties: state.specialties.filter(
          (specialty) => String(specialty.id) !== String(action.payload.id),
        ),
        isLoading: false,
        error: null,
      };

    case specialtyTypes.GET_ALL_SPECIALTIES_FAILURE:
    case specialtyTypes.CREATE_SPECIALTY_FAILURE:
    case specialtyTypes.UPDATE_SPECIALTY_FAILURE:
    case specialtyTypes.DELETE_SPECIALTY_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
};
