export const ROLE_HOME = {
  Client: '/mis-mascotas',
  Veterinarian: '/turnos-asignados',
  Administrator: '/turnos',
  SysAdmin: '/turnos',
};

const ROLE_ALLOWED_PATHS = {
  Client: ['/mi-perfil', '/mis-mascotas', '/mis-turnos'],
  Veterinarian: ['/mi-perfil', '/turnos-asignados'],
  Administrator: ['/mi-perfil', '/turnos', '/clientes', '/veterinarios', '/mascotas'],
  SysAdmin: ['/mi-perfil', '/turnos', '/administradores', '/clientes', '/veterinarios', '/mascotas'],
};

export function isPathAllowedForRole(pathname, role) {
  const allowed = ROLE_ALLOWED_PATHS[role];
  if (!allowed) return false;
  return allowed.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
