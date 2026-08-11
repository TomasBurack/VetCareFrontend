import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ThemeSwitch } from './ThemeSwitch';
import { LanguageSwitch } from './LanguageSwitch';
import { useLanguage } from '../i18n/useLanguage';

export function AuthCard({ title, subtitle, children }) {
  const { t } = useLanguage();

  return (
    <div className="auth-wrap">
      <header className="auth-header">
        <Link to="/" className="auth-back-home">
          <ArrowLeft size={15} />
          {t.welcome.backHome}
        </Link>
        <div className="auth-header-switches">
          <LanguageSwitch />
          <ThemeSwitch />
        </div>
      </header>
      <div className="auth-card-outer">
        <div className="auth-card">
          <div className="auth-brand">
            <img src="/logo.png" alt="VetCare" className="mark" /> VetCare
          </div>
          <div className="auth-title">{title}</div>
          {subtitle && <div className="auth-sub">{subtitle}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}
