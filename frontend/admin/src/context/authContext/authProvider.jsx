import { useReducer } from 'react';
import { authReducer } from './authReducer';
import { authInitialState } from './authInitialState';
import { authContext as AuthContext } from './authContext.js';
import * as authApi from '../../api/authApi.js';
import { useNavigate } from 'react-router-dom';

// Função de inicialização: roda apenas uma vez quando o componente monta
const init = (initialState) => {
  const storedUser =
    localStorage.getItem('user') || sessionStorage.getItem('user');
  
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (user) {
    return {
      ...initialState,
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
    } catch (error) {
      return error;
    }
  };

  const requestPasswordReset = async (email) => {
    return await authApi.requestPasswordReset(email, authDispatch);
  };

  const confirmPasswordReset = async (resetData) => {
    return await authApi.confirmPasswordReset(resetData, authDispatch);
  };

  const logout = async () => {
    await authApi.logout(authDispatch);
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        authDispatch,
        login,
        signup,
        logout,
        requestPasswordReset,
        confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
