const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://vetcare-api-e3f2djcgdacnfkca.chilecentral-01.azurewebsites.net";

const AUTH_STORAGE_KEY = "vetcare_auth";

export class ApiError extends Error {
  constructor(status, messages) {
    super(messages.join(" "));
    this.status = status;
    this.messages = messages;
  }
}

let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// Los mensajes genéricos se arman acá (fuera de React), así que leemos el
// idioma activo directamente del storage que mantiene el LanguageProvider.
function getGenericMessages() {
  const language = localStorage.getItem("vetcare-language") === "en" ? "en" : "es";
  return language === "en"
    ? {
        401: "Unauthorized. Please sign in again.",
        403: "You don't have permission to perform this action.",
        404: "The requested resource was not found.",
        409: "Conflict: the resource already exists or is in use.",
        500: "A server error occurred. Please try again later.",
        unexpected: "An unexpected error occurred.",
      }
    : {
        401: "No autorizado. Iniciá sesión nuevamente.",
        403: "No tenés permisos para realizar esta acción.",
        404: "No se encontró el recurso solicitado.",
        409: "Conflicto: el recurso ya existe o está en uso.",
        500: "Ocurrió un error en el servidor. Intentá de nuevo más tarde.",
        unexpected: "Ocurrió un error inesperado.",
      };
}

async function request(method, path, { body } = {}) {
  const headers = { "Content-Type": "application/json" };

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 401) {
      onUnauthorized();
    }
    if (response.status === 400 && data?.error) {
      throw new ApiError(400, data.error.split("~").filter(Boolean));
    }
    const generic = getGenericMessages();
    throw new ApiError(response.status, [
      data?.error || generic[response.status] || generic.unexpected,
    ]);
  }

  return data;
}

export const api = {
  get: (path, opts) => request("GET", path, opts),
  post: (path, body, opts) => request("POST", path, { ...opts, body }),
  put: (path, body, opts) => request("PUT", path, { ...opts, body }),
  delete: (path, opts) => request("DELETE", path, opts),
};

export { AUTH_STORAGE_KEY };
