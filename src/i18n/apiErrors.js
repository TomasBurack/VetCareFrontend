/**
 * Traducción de los mensajes de error que devuelve el backend.
 *
 * El backend responde siempre en español y no podemos modificarlo, así que
 * cuando el idioma activo es inglés matcheamos cada mensaje contra estos
 * patrones y devolvemos su equivalente. Los grupos de captura conservan los
 * valores dinámicos (ids, emails, matrículas, etc.).
 *
 * Si un mensaje no matchea ningún patrón se devuelve tal cual vino, para no
 * ocultarle información al usuario.
 */

const PATTERNS = [
  // ---------- validaciones: nombre / apellido ----------
  [/^El nombre es obligatorio\.$/, () => 'First name is required.'],
  [/^El nombre debe tener al menos 3 caracteres\.$/, () => 'First name must be at least 3 characters long.'],
  [/^El nombre no puede superar los 15 caracteres\.$/, () => 'First name cannot exceed 15 characters.'],
  [/^El apellido es obligatorio\.$/, () => 'Last name is required.'],
  [/^El apellido debe tener al menos 3 caracteres\.$/, () => 'Last name must be at least 3 characters long.'],
  [/^El apellido no puede superar los 15 caracteres\.$/, () => 'Last name cannot exceed 15 characters.'],

  // ---------- validaciones: DNI ----------
  [/^El DNI es obligatorio\.$/, () => 'ID number is required.'],
  [/^El DNI debe tener exactamente 8 caracteres\.$/, () => 'ID number must be exactly 8 characters long.'],
  [/^El DNI debe contener solo números\.$/, () => 'ID number must contain digits only.'],

  // ---------- validaciones: email ----------
  [/^El email es obligatorio\.$/, () => 'Email is required.'],
  [/^El formato del email no es válido\.$/, () => 'The email format is not valid.'],

  // ---------- validaciones: teléfono ----------
  [/^El teléfono es obligatorio\.$/, () => 'Phone number is required.'],
  [/^El teléfono debe tener al menos 9 caracteres\.$/, () => 'Phone number must be at least 9 characters long.'],
  [/^El teléfono no puede superar los 11 caracteres\.$/, () => 'Phone number cannot exceed 11 characters.'],
  [/^El teléfono debe contener solo números\.$/, () => 'Phone number must contain digits only.'],

  // ---------- validaciones: contraseña ----------
  [/^La contraseña es obligatoria\.$/, () => 'Password is required.'],
  [/^La contraseña debe tener al menos 8 caracteres\.$/, () => 'Password must be at least 8 characters long.'],
  [/^La contraseña debe contener al menos una letra mayúscula\.$/, () => 'Password must contain at least one uppercase letter.'],
  [/^La contraseña debe contener al menos una letra minúscula\.$/, () => 'Password must contain at least one lowercase letter.'],
  [/^La contraseña debe contener al menos un número\.$/, () => 'Password must contain at least one number.'],
  [/^La contraseña debe contener al menos un carácter especial\.$/, () => 'Password must contain at least one special character.'],
  [/^La nueva contraseña es obligatoria\.$/, () => 'New password is required.'],
  [/^La nueva contraseña debe tener al menos 8 caracteres\.$/, () => 'New password must be at least 8 characters long.'],
  [/^La nueva contraseña debe contener al menos una letra mayúscula\.$/, () => 'New password must contain at least one uppercase letter.'],
  [/^La nueva contraseña debe contener al menos una letra minúscula\.$/, () => 'New password must contain at least one lowercase letter.'],
  [/^La nueva contraseña debe contener al menos un número\.$/, () => 'New password must contain at least one number.'],
  [/^La nueva contraseña debe contener al menos un carácter especial\.$/, () => 'New password must contain at least one special character.'],
  [/^La nueva contraseña no puede ser igual a la anterior\.$/, () => 'The new password cannot be the same as the previous one.'],

  // ---------- validaciones: mascota ----------
  [/^El nombre de la mascota es obligatorio\.$/, () => "Pet's name is required."],
  [/^El nombre de la mascota debe tener al menos 3 caracteres\.$/, () => "Pet's name must be at least 3 characters long."],
  [/^El nombre de la mascota no puede superar los 20 caracteres\.$/, () => "Pet's name cannot exceed 20 characters."],
  [/^La edad de la mascota es obligatoria\.$/, () => "Pet's age is required."],
  [/^La edad de la mascota debe ser positiva\.$/, () => "Pet's age must be positive."],
  [/^La edad de la mascota no puede superar los 100 años\.$/, () => "Pet's age cannot exceed 100 years."],
  [/^La raza de la mascota es obligatoria\.$/, () => "Pet's breed is required."],
  [/^El tipo de mascota no es válido\. Por favor, seleccioná una opción válida de la lista\.$/, () => 'The pet type is not valid. Please select a valid option from the list.'],
  [/^'(.+)' no es una raza válida para el tipo de mascota seleccionado\.$/, (breed) => `'${breed}' is not a valid breed for the selected pet type.`],

  // ---------- validaciones: veterinario ----------
  [/^La matrícula es obligatoria\.$/, () => 'License number is required.'],
  [/^La matrícula debe tener exactamente 4 caracteres\.$/, () => 'License number must be exactly 4 characters long.'],
  [/^La matrícula debe contener solo números\.$/, () => 'License number must contain digits only.'],
  [/^La especialidad es obligatoria\.$/, () => 'Speciality is required.'],
  [/^La especialidad veterinaria no es válida\. Por favor, seleccioná una opción válida de la lista\.$/, () => 'The veterinary speciality is not valid. Please select a valid option from the list.'],

  // ---------- validaciones: turno ----------
  [/^La fecha del turno no es válida$/, () => 'The appointment date is not valid'],
  [/^El horario del turno debe estar entre las 08:00 y las 20:00\.$/, () => 'The appointment time must be between 08:00 and 20:00.'],
  [/^La mascota es obligatoria$/, () => 'Pet is required'],
  [/^La descripción es obligatoria$/, () => 'Description is required'],
  [/^El estado es obligatorio\.$/, () => 'Status is required.'],
  [/^El estado debe ser un valor válido\.$/, () => 'Status must be a valid value.'],
  [/^Solo se pueden actualizar los turnos con estado 'Pendant'\.$/, () => "Only appointments with status 'Pending' can be updated."],
  [/^Solo se pueden eliminar los turnos con estado 'Pendant'\.$/, () => "Only appointments with status 'Pending' can be deleted."],
  [/^El turno no pertenece al cliente autenticado\.$/, () => 'The appointment does not belong to the authenticated client.'],
  [/^El turno no pertenece al veterinario autenticado\.$/, () => 'The appointment does not belong to the authenticated veterinarian.'],
  [/^La mascota no pertenece al cliente autenticado\.$/, () => 'The pet does not belong to the authenticated client.'],
  [/^El veterinario ya tiene un turno el '(.+)'\.$/, (date) => `The veterinarian already has an appointment on '${date}'.`],
  [/^Las observaciones son obligatorias\.$/, () => 'Observations are required.'],
  [/^Las observaciones no pueden superar los 1000 caracteres\.$/, () => 'Observations cannot exceed 1000 characters.'],
  [/^Solo se pueden agregar observaciones a los turnos con estado 'Served'\.$/, () => "Observations can only be added to appointments with status 'Attended'."],
  [/^No se puede marcar como 'Served' un turno cuya fecha aún no llegó\.$/, () => "An appointment cannot be marked as 'Attended' before its scheduled date."],

  // ---------- recursos no encontrados ----------
  [/^No se encontró ninguna mascota con el id '(.+)'\.$/, (id) => `No pet was found with id '${id}'.`],
  [/^No se encontró ninguna mascota con el id: '(.+)'$/, (id) => `No pet was found with id: '${id}'`],
  [/^No se encontró ningún cliente con el id '(.+)'\.$/, (id) => `No client was found with id '${id}'.`],
  [/^No se encontró ningún turno con el id '(.+)'\.$/, (id) => `No appointment was found with id '${id}'.`],
  [/^No se encontró ningún veterinario con la matrícula '(.+)'\.$/, (lic) => `No veterinarian was found with license number '${lic}'.`],
  [/^No se encontró el administrador$/, () => 'The administrator was not found'],
  [/^No se encontró el sysadmin$/, () => 'The sysadmin was not found'],
  [/^No se encontró el veterinario\.?$/, () => 'The veterinarian was not found'],
  [/^No se encontró el usuario\.?$/, () => 'The user was not found'],
  [/^No se encontró el usuario asociado al token\.$/, () => 'No user associated with the token was found.'],

  // ---------- conflictos (unicidad) ----------
  [/^El email (.+) ya está en uso$/, (email) => `The email ${email} is already in use`],
  [/^La matrícula (.+) ya está en uso$/, (lic) => `The license number ${lic} is already in use`],
  // el backend todavía tiene estos tres en inglés
  [/^The email (.+) is already in use$/, (email) => `The email ${email} is already in use`],
  [/^The DNI (.+) is already in use$/, (dni) => `The ID number ${dni} is already in use`],
  [/^The Phone Number (.+) is already in use$/, (phone) => `The phone number ${phone} is already in use`],

  // ---------- autenticación ----------
  [/^Credenciales incorrectas$/, () => 'Incorrect credentials'],
  [/^La sesión no es válida o expiró$/, () => 'The session is invalid or has expired'],
  [/^El ID enviado no es válido$/, () => 'The ID sent is not valid'],
  [/^El formato del ID no es válido$/, () => 'The ID format is not valid'],
  [/^El token no es valido$/, () => 'The token is not valid'],
  [/^El token ha espirado$/, () => 'The token has expired'],
  [/^El token ya fue utilizado$/, () => 'The token has already been used'],
  [/^Demasiados intentos fallidos\. Por favor, intentá de nuevo más tarde\.$/, () => 'Too many failed attempts. Please try again later.'],

  // ---------- autenticación en dos pasos ----------
  [/^El código de verificación no es válido$/, () => 'The verification code is not valid'],
  [/^La autenticación en dos pasos no está habilitada para este usuario$/, () => 'Two-factor authentication is not enabled for this user'],
  [/^No se inició el proceso de configuración de la autenticación en dos pasos$/, () => 'The two-factor authentication setup process was not started'],

  // ---------- base de datos ----------
  [/^Ocurrió un error al guardar el usuario en la base de datos$/, () => 'An error occurred while saving the user to the database'],
];

/**
 * Traduce un mensaje del backend al inglés.
 * Si no matchea ningún patrón conocido, devuelve el mensaje original.
 */
export function translateApiMessage(message) {
  if (typeof message !== 'string') return message;

  const trimmed = message.trim();
  for (const [pattern, build] of PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return build(...match.slice(1));
  }
  return message;
}

// Fechas como devuelve el backend en los mensajes de error, ej:
// "8/21/2026 5:00:00 PM -03:00" -> se reemplazan por "21/08/2026 17:00".
const BACKEND_DATE_PATTERN = /\b(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):\d{2} (AM|PM) [+-]\d{2}:\d{2}/g;

function formatBackendDate(_match, month, day, year, hour, minute, meridiem) {
  let h = Number(hour) % 12;
  if (meridiem === 'PM') h += 12;
  const dd = day.padStart(2, '0');
  const mm = month.padStart(2, '0');
  const hh = String(h).padStart(2, '0');
  return `${dd}/${mm}/${year} ${hh}:${minute}`;
}

/**
 * Reemplaza las fechas en formato del backend (M/D/YYYY h:mm:ss AM/PM -03:00)
 * por dd/mm/yyyy hh:mm, sin offset. Se aplica independientemente del idioma.
 */
export function formatApiMessageDates(message) {
  if (typeof message !== 'string') return message;
  return message.replace(BACKEND_DATE_PATTERN, formatBackendDate);
}
