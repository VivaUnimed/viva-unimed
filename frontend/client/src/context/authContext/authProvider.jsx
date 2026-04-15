import { useReducer } from 'react';
import { authReducer } from './authReducer';
import { authInitialState } from './authInitialState';
import { authContext as AuthContext } from './authContext.js';
import * as authApi from '../../api/authApi.js';
import { useNavigate } from 'react-router-dom';

// Função de inicialização: roda apenas uma vez quando o componente monta
const init = (initialState) => {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  const storedUser =
    localStorage.getItem('user') || sessionStorage.getItem('user');
  
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (token && user) {
    return {
      ...initialState,
      token,
      user,
      isAuthenticated: true,
    };
  }
  return initialState;
};

export default function AuthProvider({ children }) {
  const [authState, authDispatch] = useReducer(
    authReducer,
    authInitialState,
    init,
  );
  const navigate = useNavigate();

  const login = async (userCredentials, rememberMe) => {
    await authApi.login(userCredentials, rememberMe, authDispatch);
  };

  const signup = async (userCredentials) => {
    try {
      await authApi.signup(userCredentials, authDispatch);
      navigate('/login');
    } catch {}
  };

  const requestPasswordReset = async (email) => {
    return await authApi.requestPasswordReset(email, authDispatch);
  };

  const confirmPasswordReset = async (resetData) => {
    return await authApi.confirmPasswordReset(resetData, authDispatch);
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        authDispatch,
        login,
        signup,
        requestPasswordReset,
        confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}