/**
 * Agrupa los mensajes de error del backend (siempre en español) por campo,
 * para poder mostrarlos debajo del input correspondiente en vez de en un
 * banner genérico.
 */
const FIELD_PATTERNS = [
  ['firstName', /^El nombre /],
  ['lastName', /^El apellido /],
  ['dni', /^El DNI /],
  ['phoneNumber', /^El teléfono /],
  ['email', /^(El email |El formato del email )/],
  ['password', /^La contraseña /],
];

export function groupErrorsByField(messages) {
  const byField = {};
  const rest = [];

  for (const message of messages ?? []) {
    const match = FIELD_PATTERNS.find(([, pattern]) => pattern.test(message));
    if (match) {
      const [field] = match;
      (byField[field] ??= []).push(message);
    } else {
      rest.push(message);
    }
  }

  return { byField, rest };
}
