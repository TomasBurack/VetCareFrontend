import { Link } from 'react-router-dom';
import { CalendarCheck, PawPrint, Stethoscope } from 'lucide-react';
import { Button } from '../components/Button';
import { ThemeSwitch } from '../components/ThemeSwitch';
import { BackgroundCarousel } from '../components/BackgroundCarousel';

const HERO_IMAGES = [
  '/welcome/slide-1.jpg',
  '/welcome/slide-2.jpg',
  '/welcome/slide-3.jpg',
  '/welcome/slide-4.jpg',
];

const SERVICES = [
  {
    icon: CalendarCheck,
    title: 'Turnos online',
    description: 'Pedí y gestioná los turnos de tus mascotas desde cualquier lugar, sin llamadas ni esperas.',
  },
  {
    icon: PawPrint,
    title: 'Historial de mascotas',
    description: 'Toda la información de tus mascotas organizada y disponible cuando la necesites.',
  },
  {
    icon: Stethoscope,
    title: 'Atención veterinaria profesional',
    description: 'Un equipo de veterinarios listos para acompañar la salud de tu mascota en cada etapa.',
  },
];

export function Welcome() {
  return (
    <div className="welcome-wrap">
      <header className="welcome-header">
        <div className="auth-brand">
          <span className="mark">V</span> VetCare
        </div>
        <ThemeSwitch className="welcome-theme-switch" />
      </header>

      <main className="welcome-hero">
        <BackgroundCarousel images={HERO_IMAGES} className="welcome-hero-bg" />
        <div className="welcome-hero-inner">
          <h1 className="welcome-title">Cuidamos a tus mascotas, en cada etapa</h1>
          <p className="welcome-sub">
            Gestioná turnos, seguí el historial clínico y accedé a atención veterinaria profesional, todo en un
            solo lugar.
          </p>
          <div className="welcome-cta">
            <Link to="/login">
              <Button variant="primary">Iniciar sesión</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Crear cuenta</Button>
            </Link>
          </div>
        </div>
      </main>

      <section className="welcome-services grid cols-3">
        {SERVICES.map((service) => (
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
