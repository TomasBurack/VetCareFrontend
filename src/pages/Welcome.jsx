import { Link } from 'react-router-dom';
import { CalendarCheck, PawPrint, Stethoscope, UserCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { ThemeSwitch } from '../components/ThemeSwitch';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { BackgroundCarousel } from '../components/BackgroundCarousel';
import { useLanguage } from '../i18n/useLanguage';
import { useAuth } from '../context/useAuth';
import { ROLE_HOME } from '../context/roleHome';

const HERO_IMAGES = [
  '/welcome/slide-1.jpg',
  '/welcome/slide-2.jpg',
  '/welcome/slide-3.jpg',
  '/welcome/slide-4.jpg',
];

export function Welcome() {
  const { t } = useLanguage();
  const { isAuthenticated, isResolvingSession, role } = useAuth();

  const services = [
    {
      icon: CalendarCheck,
      title: t.welcome.features.shiftsTitle,
      description: t.welcome.features.shiftsText,
    },
    {
      icon: PawPrint,
      title: t.welcome.features.historyTitle,
      description: t.welcome.features.historyText,
    },
    {
      icon: Stethoscope,
      title: t.welcome.features.vetsTitle,
      description: t.welcome.features.vetsText,
    },
  ];

  return (
    <div className="welcome-wrap">
      <header className="welcome-header">
        <div className="auth-brand">
          <span className="mark">V</span> VetCare
        </div>
        <div className="welcome-header-switches">
          <LanguageSwitch />
          <ThemeSwitch className="welcome-theme-switch" />
        </div>
      </header>

      <main className="welcome-hero">
        <BackgroundCarousel images={HERO_IMAGES} className="welcome-hero-bg" />
        <div className="welcome-hero-inner">
          <h1 className="welcome-title">{t.welcome.tagline}</h1>
          <p className="welcome-sub">{t.welcome.description}</p>
          {!isResolvingSession && (
            <div className="welcome-cta">
              {isAuthenticated ? (
                <Link to={ROLE_HOME[role] ?? '/'}>
                  <Button variant="primary">
                    <UserCircle size={18} />
                    {t.common.myProfile}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="primary">{t.welcome.signIn}</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline">{t.welcome.signUp}</Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <section className="welcome-services grid cols-3">
        {services.map((service) => (
          <div key={service.title} className="ficha ficha-pad welcome-service-card">
            <service.icon className="welcome-service-icon" size={28} />
            <div className="welcome-service-title">{service.title}</div>
            <p className="welcome-service-desc">{service.description}</p>
          </div>
        ))}
      </section>

      <footer className="welcome-footer">© {new Date().getFullYear()} VetCare</footer>
    </div>
  );
}
