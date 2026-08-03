import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/useTheme';

export function ThemeSwitch({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-switch ${className}`.trim()}
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label="Cambiar tema claro/oscuro"
      onClick={toggleTheme}
    >
      <Sun size={13} className="theme-switch-icon sun" />
      <span className="theme-switch-track">
        <span className="theme-switch-thumb" />
      </span>
      <Moon size={13} className="theme-switch-icon moon" />
    </button>
  );
}
