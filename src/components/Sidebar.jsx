import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { ThemeSwitch } from './ThemeSwitch';

const ROLE_NAV = {
  Client: {
    tag: 'CLIENTE',
    links: [
      { to: '/mis-mascotas', label: 'Mis mascotas' },
      { to: '/mis-turnos', label: 'Mis turnos' },
      { to: '/mi-perfil', label: 'Mi perfil' },
    ],
  },
  Veterinarian: {
    tag: 'VETERINARIO',
    links: [
      { to: '/turnos-asignados', label: 'Turnos asignados' },
      { to: '/mi-perfil', label: 'Mi perfil' },
    ],
  },
  Administrator: {
    tag: 'ADMINISTRADOR',
    links: [
      { to: '/usuarios', label: 'Todos los usuarios' },
      { to: '/clientes', label: 'Clientes' },
      { to: '/veterinarios', label: 'Veterinarios' },
      { to: '/turnos', label: 'Turnos (global)' },
      { to: '/mi-perfil', label: 'Mi perfil' },
    ],
  },
  SysAdmin: {
    tag: 'SYSADMIN',
    links: [
      { to: '/administradores', label: 'Administradores' },
      { to: '/clientes', label: 'Clientes' },
      { to: '/mi-perfil', label: 'Mi perfil' },
    ],
  },
};

export function Sidebar() {
  const { role, logout } = useAuth();
  const nav = ROLE_NAV[role];

  if (!nav) return null;

  return (
    <div className="sidebar">
      <div className="brand">VetCare</div>
      <span className="role-tag">{nav.tag}</span>
      <ThemeSwitch />
      <hr className="divider" />
      <nav>
        {nav.links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'current' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <hr className="divider" />
      <button className="btn btn-ghost logout-btn" onClick={logout}>
        <LogOut size={15} /> Cerrar sesión
      </button>
    </div>
  );
}
