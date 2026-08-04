import { useLanguage } from '../i18n/useLanguage';

export function ErrorBanner({ messages }) {
  const { t, tApiList } = useLanguage();

  if (!messages || messages.length === 0) return null;

  // Los mensajes pueden venir del backend (siempre en español) o de la app.
  const translated = tApiList(messages);

  if (translated.length === 1) {
    return <div className="error-banner">{translated[0]}</div>;
  }

  return (
    <div className="error-banner">
      <div>{t.errors.checkFields}</div>
      <ul>
        {translated.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
