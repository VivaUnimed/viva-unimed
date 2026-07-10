const BASE_URL = '';

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!text) {
    return null;
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
};

const getErrorMessage = (errorData) => {
  if (typeof errorData === 'string') {
    return errorData;
  }

  return (
    errorData?.message ||
    errorData?.error ||
    'Erro de comunicação com o servidor'
  );
};

const handleResponse = async (response, options = {}) => {
  const { isPublic = false } = options;

  if (response.status === 401) {
    const errorData = await parseResponseBody(response);
    const message = getErrorMessage(errorData);

    // Se for rota pública, como login, cadastro ou reset,
    // não deve dizer "sessão expirada".
    if (isPublic) {
      throw new Error(message || 'E-mail ou senha inválidos.');
    }

    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');

    if (window.location.pathname !== '/login') {
      window.location.href = '/login?expired=true';
    }

    throw new Error('Sessão expirada. Redirecionando...');
  }

  if (!response.ok) {
    const errorData = await parseResponseBody(response);
    throw new Error(getErrorMessage(errorData));
  }

  if (response.status === 204) {
    return null;
  }

  return parseResponseBody(response);
};

const getHeaders = (options = {}) => {
  const { useAuth = true } = options;

  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (useAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const postRequest = async (endpoint, data, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getHeaders(options),
    body: JSON.stringify(data),
  });

  return await handleResponse(response, options);
};

export const putRequest = async (endpoint, data, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: getHeaders(options),
    body: JSON.stringify(data),
  });

  return await handleResponse(response, options);
};

export const getRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: getHeaders(options),
  });

  return await handleResponse(response, options);
};

export const deleteRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getHeaders(options),
  });

  return await handleResponse(response, options);
};