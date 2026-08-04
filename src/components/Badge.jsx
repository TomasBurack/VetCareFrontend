import { useLanguage } from '../i18n/useLanguage';

export function Badge({ status }) {
  const { t } = useLanguage();
  const key = status?.toLowerCase();
  return <span className={`badge ${key}`}>{t.shifts.statuses[key] ?? status}</span>;
}
