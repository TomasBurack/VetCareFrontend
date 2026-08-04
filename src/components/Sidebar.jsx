import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useLanguage } from '../i18n/useLanguage';
import { ThemeSwitch } from './ThemeSwitch';
import { LanguageSwitch } from './LanguageSwitch';

const ROLE_NAV = {
  Client: {
    tag: (t) => t.roles.client,
    links: [
      { to: '/mis-mascotas', label: (t) => t.nav.myPets },
      { to: '/mis-turnos', label: (t) => t.nav.myShifts },
      { to: '/mi-perfil', label: (t) => t.nav.profile },
    ],
  },
  Veterinarian: {
    tag: (t) => t.roles.veterinarian,
    links: [
      { to: '/turnos-asignados', label: (t) => t.nav.assignedShifts },
      { to: '/mi-perfil', label: (t) => t.nav.profile },
    ],
  },
  Administrator: {
    tag: (t) => t.roles.administrator,
    links: [
      { to: '/clientes', label: (t) => t.nav.clients },
      { to: '/veterinarios', label: (t) => t.nav.veterinarians },
      { to: '/mascotas', label: (t) => t.nav.pets },
      { to: '/turnos', label: (t) => t.nav.shiftsGlobal },
      { to: '/mi-perfil', label: (t) => t.nav.profile },
    ],
  },
  SysAdmin: {
    tag: (t) => t.roles.sysadmin,
    links: [
      { to: '/administradores', label: (t) => t.nav.administrators },
      { to: '/clientes', label: (t) => t.nav.clients },
      { to: '/veterinarios', label: (t) => t.nav.veterinarians },
      { to: '/mascotas', label: (t) => t.nav.pets },
      { to: '/mi-perfil', label: (t) => t.nav.profile },
    ],
  },
};

export function Sidebar() {
  const { role, logout } = useAuth();
  const { t } = useLanguage();
  const nav = ROLE_NAV[role];

  if (!nav) return null;

  return (
    <div className="sidebar">
      <div className="brand">VetCare</div>
      <span className="role-tag">{nav.tag(t)}</span>
      <ThemeSwitch />
      <LanguageSwitch className="sidebar-lang" />
      <hr className="divider" />
      <nav>
        {nav.links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'current' : '')}
          >
            {link.label(t)}
          </NavLink>
        ))}
      </nav>
      <hr className="divider" />
      <button className="btn btn-ghost logout-btn" onClick={logout}>
        <LogOut size={15} /> {t.common.logout}
      </button>
    </div>
  );
}
