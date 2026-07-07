import { authInitialState } from './authInitialState';
import * as authTypes from './authTypes';

export const authReducer = (state, action) => {
  switch (action.type) {
    // Inicialização da sessão
    case authTypes.INIT_SESSION_REQUEST:
      return {
        ...state,
        isSessionLoading: true,
        error: null,
      };

    case authTypes.INIT_SESSION_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        isSessionLoading: false,
        error: null,
      };

    case authTypes.INIT_SESSION_FAILURE:
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isSessionLoading: false,
        error: action.payload?.error || null,
      };

    // login
    case authTypes.LOGIN_REQUEST:
      return {
        ...state,
        isAuthenticating: true,
        isLoading: true,
        error: null,
        message: '',
      };

    case authTypes.LOGIN_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        isAuthenticating: false,
        isLoading: false,
        error: null,
      };

    case authTypes.LOGIN_FAILURE:
      return {
        ...state,
        token: null,
        user: null,
        error: action.payload.error,
        isAuthenticated: false,
        isAuthenticating: false,
        isLoading: false,
      };

    // logout
    case authTypes.LOGOUT_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
        message: '',
      };

    case authTypes.LOGOUT_SUCCESS:
      return {
        ...authInitialState,
        isLoading: false,
        isSessionLoading: false,
      };

    // signup
    case authTypes.SIGNUP_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
        message: '',
      };

    case authTypes.SIGNUP_SUCCESS:
      return {
        ...state,
        message: action.payload.message,
        isLoading: false,
      };

    case authTypes.SIGNUP_FAILURE:
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
      };

    default:
      return state;
  }
};
