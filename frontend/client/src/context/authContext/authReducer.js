import { authInitialState } from './authInitialState';
import * as authTypes from './authTypes';

export const authReducer = (state, action) => {
  switch (action.type) {
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
      };

    case authTypes.LOGIN_FAILURE:
      return {
        ...state,
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

    // password reset request
    case authTypes.PASSWORD_RESET_REQUEST_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
        message: '',
      };

    case authTypes.PASSWORD_RESET_REQUEST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        message: action.payload.message,
        resetEmail: action.payload.email,
      };

    case authTypes.PASSWORD_RESET_REQUEST_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    // password reset confirm
    case authTypes.PASSWORD_RESET_CONFIRM_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
        message: '',
      };

    case authTypes.PASSWORD_RESET_CONFIRM_SUCCESS:
      return {
        ...state,
        isLoading: false,
        message: action.payload.message,
        resetEmail: '',
      };

    case authTypes.PASSWORD_RESET_CONFIRM_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
};