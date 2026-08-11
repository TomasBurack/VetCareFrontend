import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { useLanguage } from '../../i18n/useLanguage';

export function ErrorPage({ code, actionTo, onAction }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const copy = t.errorPages[code];

  return (
    <div className="error-page">
      <div className="error-page-card">
        <img
          className="error-page-image"
          src={`https://http.cat/${code}`}
          alt={`HTTP ${code}`}
          loading="lazy"
        />
        <div className="error-page-code">{code}</div>
        <h1 className="error-page-title">{copy.title}</h1>
        <p className="error-page-subtitle">{copy.subtitle}</p>
        <div className="error-page-actions">
          {onAction ? (
            <Button variant="primary" onClick={onAction}>
              {copy.action}
            </Button>
          ) : (
            <Link to={actionTo ?? '/'}>
              <Button variant="primary">{copy.action}</Button>
            </Link>
          )}
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            {t.errorPages.goBack}
          </button>
        </div>
      </div>
    </div>
  );
}
