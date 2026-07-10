import { professionalTypes } from './professionalTypes';

export const professionalReducer = (state, action) => {
  switch (action.type) {
    case professionalTypes.GET_ALL_PROFESSIONALS_REQUEST:
    case professionalTypes.CREATE_PROFESSIONAL_REQUEST:
    case professionalTypes.UPDATE_PROFESSIONAL_REQUEST:
    case professionalTypes.DELETE_PROFESSIONAL_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case professionalTypes.GET_ALL_PROFESSIONALS_SUCCESS:
      return {
        ...state,
        professionals: action.payload.professionals,
        isLoading: false,
        error: null,
      };

    case professionalTypes.CREATE_PROFESSIONAL_SUCCESS:
      return {
        ...state,
        professionals: [...state.professionals, action.payload.professional],
        isLoading: false,
        error: null,
      };

    case professionalTypes.UPDATE_PROFESSIONAL_SUCCESS:
      return {
        ...state,
        professionals: state.professionals.map((professional) =>
          professional.id === action.payload.id
            ? action.payload.professional
            : professional,
        ),
        isLoading: false,
        error: null,
      };

    case professionalTypes.DELETE_PROFESSIONAL_SUCCESS:
      return {
        ...state,
        professionals: state.professionals.filter(
          (professional) => professional.id !== action.payload.id,
        ),
        isLoading: false,
        error: null,
      };

    case professionalTypes.GET_ALL_PROFESSIONALS_FAILURE:
    case professionalTypes.CREATE_PROFESSIONAL_FAILURE:
    case professionalTypes.UPDATE_PROFESSIONAL_FAILURE:
    case professionalTypes.DELETE_PROFESSIONAL_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
};
