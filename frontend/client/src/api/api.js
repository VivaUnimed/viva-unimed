const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {

  // 1. Verifica se o token expirou ou é inválido
  if (response.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // Redireciona para o login
    // Adicionado um parâmetro 'expired=true' para avisar o usuário depois
    if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
    }
    
    throw new Error('Sessão expirada. Redirecionando...');
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erro na requisição');
  }

  if (response.status === 204) {
    return null; 
  }

  return response.json();
};

// Helper para centralizar os headers
const getHeaders = () => {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const postRequest = async (endpoint, data) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return await handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const putRequest = async (endpoint, data) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return await handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getRequest = async (endpoint) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteRequest = async (endpoint) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};