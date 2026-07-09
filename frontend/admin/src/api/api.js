// Pega a URL base da API definida no arquivo .env.
// Se ela existir, remove espaços antes/depois com trim().
// Se não existir, usa '/api' como valor padrão.
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';

// Normaliza a URL base removendo a barra final, caso exista.
const BASE_URL = rawBaseUrl.endsWith('/')
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

// Tenta converter a resposta para JSON.
// Caso a resposta não tenha corpo ou não seja JSON válido, retorna null.
const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

// Remove dados de autenticação salvos no navegador.
const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

// Centraliza o tratamento das respostas da API.
const handleResponse = async (response) => {
  // 401: usuário não autenticado ou sessão expirada
  if (response.status === 401) {
    clearAuthStorage();

    // Redireciona para o login
    // Adicionado um parâmetro 'expired=true' para avisar o usuário depois
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?expired=true';
    }

    throw new Error('Sessão expirada. Redirecionando...');
  }

  // 403: usuário autenticado, mas sem permissão para acessar o recurso
  if (response.status === 403) {
    const errorData = await parseJsonSafe(response);
    throw new Error(errorData?.details || errorData?.message || 'Acesso negado');
  }

  // Trata outros erros HTTP, como 400, 404 e 500
  if (!response.ok) {
    const errorData = await parseJsonSafe(response);
    throw new Error(errorData?.details || errorData?.message || 'Erro na requisição');
  }

  // 204: requisição bem-sucedida, mas sem conteúdo na resposta
  if (response.status === 204) {
    return null;
  }

  // Retorna o corpo da resposta em JSON
  return parseJsonSafe(response);
};

// Monta os headers padrão das requisições.
// Se houver token salvo, adiciona Authorization: Bearer <token>.
const getHeaders = () => {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const postRequest = async (endpoint, data) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

// Requisição PUT usada para atualizar dados existentes.
export const putRequest = async (endpoint, data) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

// Requisição GET usada para buscar dados no backend.
export const getRequest = async (endpoint) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// Requisição DELETE usada para remover dados no backend.
export const deleteRequest = async (endpoint, data) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    method: 'DELETE',
    headers: getHeaders(),
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  return handleResponse(response);
};
