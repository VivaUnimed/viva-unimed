import * as authTypes from '../context/authContext/authTypes';
import { clearAuthStorage } from '../utils/auth/clearAuthStorage';
import { getRequest, postRequest } from './api';
import { toast } from 'react-toastify';

// Busca os dados completos do usuário autenticado.
// Esse endpoint deve retornar roles e permissions.
export const getMe = async () => {
  return getRequest('/user/me');
};

// Salva apenas o token antes de chamar /user/me
const saveTokenStorage = ({ token, rememberMe }) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;

  otherStorage.removeItem('token');
  otherStorage.removeItem('user');

  storage.setItem('token', token);
};

// Salva token e usuário completo após carregar /user/me,
// dependendo da opção "lembrar-me".
const saveAuthStorage = ({ token, user, rememberMe }) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;

  // Garante que os dados antigos não fiquem duplicados no outro storage
  otherStorage.removeItem('token');
  otherStorage.removeItem('user');

  storage.setItem('token', token);
  storage.setItem('user', JSON.stringify(user));
};

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
            return data?.message || 'Erro ao cadastrar';
          },
        },
      },
    );

    if (!data) {
      throw new Error('Resposta inválida do servidor');
    }

    const { message } = data;

    dispatch({
      type: authTypes.SIGNUP_SUCCESS,
      payload: { message },
    });

    return data;
  } catch (error) {
    dispatch({
      type: authTypes.SIGNUP_FAILURE,
      payload: { error: error.message },
    });

    throw error;
  }
};

export const login = async (userCredentials, rememberMe = true, dispatch) => {
  dispatch({ type: authTypes.LOGIN_REQUEST });

  try {
    const { token, user } = await toast.promise(
      async () => {
        // Faz login e recebe o token
        const loginData = await postRequest('/auth/login', userCredentials);

        if (!loginData || !loginData.token) {
          throw new Error('Resposta inválida do servidor');
        }

        const { token } = loginData;

        // Salva o token antes de chamar /user/me
        // pois o getRequest precisa enviar Authorization: Bearer <token>
        saveTokenStorage({ token, rememberMe });

        // Busca os dados completos do usuário logado
        const user = await getMe();

        if (!user) {
          throw new Error('Não foi possível carregar os dados do usuário');
        }

        // Salva o usuário completo com roles e permissions
        saveAuthStorage({ token, user, rememberMe });

        return { token, user };
      },
      {
        pending: 'Autenticando...',
        success: 'Login realizado!',
        error: {
          render({ data }) {
            return data?.message || 'E-mail ou senha incorretos';
          },
        },
      },
    );

    dispatch({
      type: authTypes.LOGIN_SUCCESS,
      payload: {
        token,
        user,
      },
    });

    return { token, user };
  } catch (error) {
    clearAuthStorage();

    console.log(error)

    dispatch({
      type: authTypes.LOGIN_FAILURE,
      payload: { error: error.message },
    });

    throw error;
  }
};

export const logout = async (dispatch) => {
  dispatch({ type: authTypes.LOGOUT_REQUEST });

  try {
    await getRequest('/auth/logout');

    toast.success('Sessão encerrada com sucesso!');
  } catch (error) {
    console.warn('Falha ao invalidar sessão no servidor:', error.message);
  } finally {
    clearAuthStorage();

    dispatch({ type: authTypes.LOGOUT_SUCCESS });
  }
};
