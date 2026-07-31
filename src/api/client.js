const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AUTH_STORAGE_KEY = 'vetcare_auth';

export class ApiError extends Error {
  constructor(status, messages) {
    super(messages.join(' '));
    this.status = status;
    this.messages = messages;
  }
}

let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(method, path, { body } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 401) {
      onUnauthorized();
    }
    if (response.status === 400 && data?.error) {
      throw new ApiError(400, data.error.split('~').filter(Boolean));
    }
    const genericMessages = {
      401: 'No autorizado. Iniciá sesión nuevamente.',
      403: 'No tenés permisos para realizar esta acción.',
      404: 'No se encontró el recurso solicitado.',
      409: 'Conflicto: el recurso ya existe o está en uso.',
      500: 'Ocurrió un error en el servidor. Intentá de nuevo más tarde.',
    };
    throw new ApiError(response.status, [
      data?.error || genericMessages[response.status] || 'Ocurrió un error inesperado.',
    ]);
  }

  return data;
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
};

export { AUTH_STORAGE_KEY };
