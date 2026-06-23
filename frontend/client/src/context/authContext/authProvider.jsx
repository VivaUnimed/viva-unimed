import { useReducer } from 'react';
import { authReducer } from './authReducer';
import { authInitialState } from './authInitialState';
import { authContext as AuthContext } from './authContext.js';
import * as authApi from '../../api/authApi.js';
import * as authTypes from './authTypes.js';
import { useNavigate } from 'react-router-dom';

// Função de inicialização: roda apenas uma vez quando o componente monta
const init = (initialState) => {
  const storedUser =
    localStorage.getItem('user') || sessionStorage.getItem('user');

  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  }

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

  const demoLogin = () => {
    const user = {
      id: 'demo',
      name: 'Paciente Demo',
      email: 'demo@vivaunimed.local',
    };

    sessionStorage.setItem('user', JSON.stringify(user));

    authDispatch({
      type: authTypes.LOGIN_SUCCESS,
      payload: {
        user,
      },
    });
  };

  const signup = async (userCredentials) => {
    await authApi.signup(userCredentials, authDispatch);
    navigate('/login');
  };

  const logout = async () => {
    await authApi.logout(authDispatch);
    navigate('/login');
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
        demoLogin,
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
