import { useCallback, useEffect, useMemo, useState } from 'react';
import { LanguageContext } from './languageContextObject';
import { es } from './es';
import { en } from './en';
import { translateApiMessage, formatApiMessageDates } from './apiErrors';

const STORAGE_KEY = 'vetcare-language';
const DICTIONARIES = { es, en };

function getInitialLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'es' || stored === 'en') return stored;
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
  }, []);

  const value = useMemo(() => {
    const t = DICTIONARIES[language];
    return {
      language,
      setLanguage,
      toggleLanguage,
      t,
      // Traduce los mensajes que llegan del backend (siempre en español) y
      // normaliza las fechas que puedan traer a dd/mm/yyyy hh:mm sin offset.
      tApi: (message) => {
        const formatted = formatApiMessageDates(message);
        return language === 'en' ? translateApiMessage(formatted) : formatted;
      },
      tApiList: (messages) =>
        (messages ?? [])
          .map(formatApiMessageDates)
          .map((message) => (language === 'en' ? translateApiMessage(message) : message)),
    };
  }, [language, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
