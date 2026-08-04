import { Languages } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';

export function LanguageSwitch({ className = '' }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={`lang-switch ${className}`.trim()} role="group" aria-label={t.language.label}>
      <Languages size={13} className="lang-switch-icon" />
      <button
        type="button"
        className={language === 'es' ? 'active' : ''}
        aria-pressed={language === 'es'}
        onClick={() => setLanguage('es')}
      >
        ES
      </button>
      <button
        type="button"
        className={language === 'en' ? 'active' : ''}
        aria-pressed={language === 'en'}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
    </div>
  );
}
