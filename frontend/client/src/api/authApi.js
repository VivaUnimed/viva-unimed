import * as authTypes from '../context/authContext/authTypes';
import { postRequest } from './api';
import { toast } from 'react-toastify';


/* --------------------------------------------------------------------------
 *  SIGN UP  –  POST /patient/signup
 * ------------------------------------------------------------------------*/
export const signup = async (
  userCredentials,
  dispatch,
) => {
  dispatch({
    type: authTypes.SIGNUP_REQUEST,
  });

  try {
      const data = await toast.promise(
        postRequest('/api/patient', userCredentials),
        {
          pending: 'Criando sua conta...',
          success: 'Conta criada com sucesso!',
          error: {
            render({ data: error }) {
              return (
                error?.message ||
                'Não foi possível concluir o cadastro.'
              );
            },
          },
        },
      );

    dispatch({
      type: authTypes.SIGNUP_SUCCESS,
      payload: {
        patient: data,
      },
    });

    return data;
  } catch (error) {
    dispatch({
      type: authTypes.SIGNUP_FAILURE,
      payload: {
        error: error.message,
      },
    });

    throw error;
  }
};

/* --------------------------------------------------------------------------
 *  LOGIN  –  POST /auth/login
 * ------------------------------------------------------------------------*/
export const login = async (
  userCredentials,
  rememberMe = true,
  dispatch,
) => {
  dispatch({ type: authTypes.LOGIN_REQUEST });

  try {
    const data = await toast.promise(
      postRequest('/api/auth/login', userCredentials, {
        withAuth: false,
        skipUnauthorizedRedirect: true,
      }),
      {
        pending: 'Autenticando...',
        success: 'Login realizado!',
        error: {
          render({ data }) {
            return (
              data?.response?.data?.message ||
              data?.message ||
              'Não foi possível concluir o login no momento.'
            );
          },
        },
      },
    );

    const responseData = data?.data || data;

    const token =
      responseData?.token ||
      responseData?.accessToken ||
      responseData?.access_token;

    if (!token) {
      throw new Error('Token não encontrado na resposta do servidor');
    }

    const user =
      responseData?.user ||
      responseData?.usuario ||
      responseData?.patient ||
      responseData?.paciente ||
      {
        id: responseData?.id,
        name: responseData?.name,
        cpf: responseData?.cpf,
        email: responseData?.email,
        phone: responseData?.phone,
      };

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(user));

    dispatch({
      type: authTypes.LOGIN_SUCCESS,
      payload: {
        token,
        user,
      },
    });

    return {
      token,
      user,
    };
  } catch (error) {
    dispatch({
      type: authTypes.LOGIN_FAILURE,
      payload: { error: error.message },
    });

    throw error;
  }
};

/* --------------------------------------------------------------------------
 *  LOGOUT  –  POST /auth/logout   (opcional no backend)
 * ------------------------------------------------------------------------*/
export const logout = async (dispatch) => {
  dispatch({ type: authTypes.LOGOUT_REQUEST });

  localStorage.removeItem('token');
  localStorage.removeItem('user');

  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');

  dispatch({ type: authTypes.LOGOUT_SUCCESS });
};

/* --------------------------------------------------------------------------
 *  PASSWORD RESET
 *  (as duas funções permaneceram iguais – só mude /auth/... se precisar)
 * ------------------------------------------------------------------------*/
export const requestPasswordReset = async (email, dispatch) => {
  dispatch({ type: authTypes.PASSWORD_RESET_REQUEST_REQUEST });

  try {
    const data = await toast.promise(
      postRequest('/api/auth/reset-password-request', { email }),
      {
        pending: 'Enviando código de recuperação...',
        success: 'Código de recuperação enviado!',
        error: { render({ data }) {
          return (
            data?.response?.data?.message ||
            data?.message ||
            'Não foi possível enviar o código de recuperação.'
          );
        }},
      },
    );

    const { message } = data || {};
    if (!message) throw new Error('Resposta inválida do servidor');

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
      postRequest('/api/auth/reset-password-confirm', resetData),
      {
        pending: 'Validando token e redefinindo senha...',
        success: 'Senha redefinida com sucesso!',
        error: { render({ data }) {
          return (
            data?.response?.data?.message ||
            data?.message ||
            'Não foi possível redefinir a senha.'
          );
        }},
      },
    );

    const { message } = data || {};
    if (!message) throw new Error('Resposta inválida do servidor');

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