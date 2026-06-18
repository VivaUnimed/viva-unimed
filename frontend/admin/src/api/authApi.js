import { useNavigate } from 'react-router-dom';
import * as authTypes from '../context/authContext/authTypes';
import { postRequest } from './api';
import { toast } from 'react-toastify';

export const signup = async (userCredentials, dispatch) => {
  dispatch({ type: authTypes.SIGNUP_REQUEST });

  try {
    const data = await toast.promise(
      postRequest('/usuarios/signup', userCredentials),
      {
        pending: 'Criando sua conta...',
        success: 'Conta criada com sucesso!',
        error: {
          render({ data }) {
            // "data" aqui é o erro lançado pelo postRequest
            return (
              data?.response?.data?.message ||
              data?.message ||
              'Erro ao cadastrar'
            );
          },
        },
      },
    );

    if (!data) {
      throw new Error('Resposta inválida do servidor');
    }

    const { message } = data;

    dispatch({ type: authTypes.SIGNUP_SUCCESS, payload: { message } });
  } catch (error) {
    dispatch({
      type: authTypes.SIGNUP_FAILURE,
      payload: { error: error.message },
    });
  }
};

export const login = async (userCredentials, rememberMe=true, dispatch) => {
  dispatch({ type: authTypes.LOGIN_REQUEST });

  try {
    const data = await toast.promise(
      postRequest('/usuarios/login', userCredentials),
      {
        pending: 'Autenticando...',
        success: 'Login realizado!',
        error: {
          render({ data }) {
            return (
              data?.response?.data?.message || 'E-mail ou senha incorretos'
            );
          },
        },
      },
    );

    if (!data || !data.token || !data.user) {
      throw new Error('Resposta inválida do servidor');
    }

    const { token, user } = data;

    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    }

    dispatch({
      type: authTypes.LOGIN_SUCCESS,
      payload: {
        token,
        user,
      },
    });
  } catch (error) {
    dispatch({
      type: authTypes.LOGIN_FAILURE,
      payload: { error: error.message },
    });
  }
};

export const logout = async (dispatch) => {
  dispatch({ type: authTypes.LOGOUT_REQUEST });

  try {
    await postRequest('/usuarios/logout', {});

    const data = await toast.promise(postRequest('/usuarios/logout', {}), {
      pending: 'Saindo...',
      error: {
        render({ data }) {
          return data?.response?.data?.message || 'E-mail ou senha incorretos';
        },
      },
    });
  } catch (error) {
    console.warn('Falha ao invalidar token no servidor:', error.message);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    dispatch({ type: authTypes.LOGOUT_SUCCESS });
  }
};

export const requestPasswordReset = async (email, dispatch) => {
  dispatch({ type: authTypes.PASSWORD_RESET_REQUEST_REQUEST });

  try {
    const data = await toast.promise(
      postRequest('/usuarios/reset-password-request', { email }),
      {
        pending: 'Enviando código de recuperação...',
        success: 'Código de recuperação enviado com sucesso!',
        error: {
          render({ data }) {
            return (
              data?.response?.data?.message ||
              data?.message ||
              'Não foi possível enviar o código de recuperação.'
            );
          },
        },
      },
    );

    if (!data) {
      throw new Error('Resposta inválida do servidor');
    }

    const { message } = data;

    dispatch({
      type: authTypes.PASSWORD_RESET_REQUEST_SUCCESS,
      payload: { message, email },
    });

    return data;

  } catch (error) {
    dispatch({
      type: authTypes.PASSWORD_RESET_REQUEST_FAILURE,
      payload: { error: error.message },
    });

    throw error;
  }
};

export const confirmPasswordReset = async (resetData, dispatch) => {
  dispatch({ type: authTypes.PASSWORD_RESET_CONFIRM_REQUEST });

  try {
    const data = await toast.promise(
      postRequest('/usuarios/reset-password-confirm', resetData),
      {
        pending: 'Validando Token e Redefinindo senha...',
        success: 'Senha redefinida com sucesso!',
        error: {
          render({ data }) {
            return (
              data?.response?.data?.message ||
              data?.message ||
              'Não foi possível redefinir a senha.'
            );
          },
        },
      },
    );

    if (!data) {
      throw new Error('Resposta inválida do servidor');
    }

    const { message } = data;

    dispatch({
      type: authTypes.PASSWORD_RESET_CONFIRM_SUCCESS,
      payload: { message },
    });

    return data;
  } catch (error) {
    dispatch({
      type: authTypes.PASSWORD_RESET_CONFIRM_FAILURE,
      payload: { error: error.message },
    });

    throw error;
  }
};