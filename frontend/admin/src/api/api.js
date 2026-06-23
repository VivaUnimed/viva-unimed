const handleResponse = async (response) => {

  // 1. Verifica se o token expirou ou é inválido
  if (response.status === 401) {
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
  const headers = {
    'Content-Type': 'application/json',
  };

  return headers;
};

export const postRequest = async (endpoint, data) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify(data),
    });

    return await handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const putRequest = async (endpoint, data) => {
  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify(data),
    });

    return await handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getRequest = async (endpoint) => {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'same-origin',
    });

    return await handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteRequest = async (endpoint) => {
  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'same-origin',
    });

    return await handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};